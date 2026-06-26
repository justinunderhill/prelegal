from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models import DocumentRecord, User, utc_now


class DocumentError(ValueError):
    pass


@dataclass(frozen=True)
class DocumentData:
    id: str
    owner_id: str
    slug: str
    agreement_name: str
    status: str
    values: dict
    file_name: str | None
    created_at: datetime
    updated_at: datetime
    exported_at: datetime | None


def _require_user(db: Session, owner_id: str) -> User:
    user = db.get(User, owner_id)
    if not user:
        raise DocumentError("Unknown document owner.")
    return user


def _decode_values(values_json: str) -> dict:
    try:
        value = json.loads(values_json or "{}")
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


def _to_data(record: DocumentRecord) -> DocumentData:
    return DocumentData(
        id=record.id,
        owner_id=record.owner_id,
        slug=record.slug,
        agreement_name=record.agreement_name,
        status=record.status,
        values=_decode_values(record.values_json),
        file_name=record.file_name,
        created_at=record.created_at,
        updated_at=record.updated_at,
        exported_at=record.exported_at,
    )


def list_documents(db: Session, owner_id: str) -> list[DocumentData]:
    _require_user(db, owner_id)
    records = (
        db.query(DocumentRecord)
        .filter(DocumentRecord.owner_id == owner_id)
        .order_by(DocumentRecord.updated_at.desc())
        .all()
    )
    return [_to_data(record) for record in records]


def upsert_draft(
    db: Session,
    *,
    owner_id: str,
    slug: str,
    agreement_name: str,
    values: dict,
) -> DocumentData:
    _require_user(db, owner_id)
    record = (
        db.query(DocumentRecord)
        .filter(
            DocumentRecord.owner_id == owner_id,
            DocumentRecord.slug == slug,
            DocumentRecord.status == "draft",
        )
        .first()
    )

    now = utc_now()
    if record is None:
        record = DocumentRecord(
            id=str(uuid4()),
            owner_id=owner_id,
            slug=slug,
            agreement_name=agreement_name,
            status="draft",
            created_at=now,
        )
        db.add(record)

    record.agreement_name = agreement_name
    record.values_json = json.dumps(values)
    record.updated_at = now
    db.commit()
    db.refresh(record)
    return _to_data(record)


def delete_draft(db: Session, *, owner_id: str, slug: str) -> None:
    _require_user(db, owner_id)
    (
        db.query(DocumentRecord)
        .filter(
            DocumentRecord.owner_id == owner_id,
            DocumentRecord.slug == slug,
            DocumentRecord.status == "draft",
        )
        .delete()
    )
    db.commit()


def record_export(
    db: Session,
    *,
    owner_id: str,
    slug: str,
    agreement_name: str,
    file_name: str,
) -> DocumentData:
    _require_user(db, owner_id)
    now = utc_now()
    record = DocumentRecord(
        id=str(uuid4()),
        owner_id=owner_id,
        slug=slug,
        agreement_name=agreement_name,
        status="exported",
        values_json="{}",
        file_name=file_name,
        created_at=now,
        updated_at=now,
        exported_at=now,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_data(record)


def delete_export(db: Session, *, owner_id: str, document_id: str) -> None:
    _require_user(db, owner_id)
    (
        db.query(DocumentRecord)
        .filter(
            DocumentRecord.owner_id == owner_id,
            DocumentRecord.id == document_id,
            DocumentRecord.status == "exported",
        )
        .delete()
    )
    db.commit()
