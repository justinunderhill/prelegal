from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.document_service import (
    DocumentError,
    delete_draft,
    delete_export,
    list_documents,
    record_export,
    upsert_draft,
)

router = APIRouter(prefix="/api/documents", tags=["documents"])


class DraftRequest(BaseModel):
    owner_id: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    agreement_name: str = Field(min_length=1)
    values: dict = Field(default_factory=dict)


class ExportRequest(BaseModel):
    owner_id: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    agreement_name: str = Field(min_length=1)
    file_name: str = Field(min_length=1)


class DocumentResponse(BaseModel):
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


def _not_found_or_bad_owner(error: DocumentError):
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(error))


@router.get("", response_model=list[DocumentResponse])
def documents(owner_id: str = Query(min_length=1), db: Session = Depends(get_db)):
    try:
        return list_documents(db, owner_id)
    except DocumentError as error:
        _not_found_or_bad_owner(error)


@router.put("/drafts/{slug}", response_model=DocumentResponse)
def save_draft(slug: str, request: DraftRequest, db: Session = Depends(get_db)):
    if request.slug != slug:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug mismatch.")

    try:
        return upsert_draft(
            db,
            owner_id=request.owner_id,
            slug=request.slug,
            agreement_name=request.agreement_name,
            values=request.values,
        )
    except DocumentError as error:
        _not_found_or_bad_owner(error)


@router.delete("/drafts/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def remove_draft(slug: str, owner_id: str = Query(min_length=1), db: Session = Depends(get_db)):
    try:
        delete_draft(db, owner_id=owner_id, slug=slug)
    except DocumentError as error:
        _not_found_or_bad_owner(error)


@router.post("/exports", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_export(request: ExportRequest, db: Session = Depends(get_db)):
    try:
        return record_export(
            db,
            owner_id=request.owner_id,
            slug=request.slug,
            agreement_name=request.agreement_name,
            file_name=request.file_name,
        )
    except DocumentError as error:
        _not_found_or_bad_owner(error)


@router.delete("/exports/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_export(
    document_id: str,
    owner_id: str = Query(min_length=1),
    db: Session = Depends(get_db),
):
    try:
        delete_export(db, owner_id=owner_id, document_id=document_id)
    except DocumentError as error:
        _not_found_or_bad_owner(error)
