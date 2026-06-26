from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.database import Base, get_db
from app.main import app as fastapi_app


def make_client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    return TestClient(fastapi_app)


def create_user(client: TestClient, email: str = "user@example.com") -> str:
    response = client.post(
        "/api/auth/signup",
        json={"email": email, "password": "secret"},
    )
    assert response.status_code == 201
    return response.json()["id"]


def test_save_and_list_draft_for_owner():
    client = make_client()
    owner_id = create_user(client)

    response = client.put(
        "/api/documents/drafts/mutual-nda",
        json={
            "owner_id": owner_id,
            "slug": "mutual-nda",
            "agreement_name": "Mutual NDA",
            "values": {"purpose": "Evaluate partnership"},
        },
    )

    assert response.status_code == 200
    assert response.json()["values"] == {"purpose": "Evaluate partnership"}

    list_response = client.get(f"/api/documents?owner_id={owner_id}")
    assert list_response.status_code == 200
    assert [item["slug"] for item in list_response.json()] == ["mutual-nda"]

    fastapi_app.dependency_overrides.clear()


def test_upsert_draft_reuses_record():
    client = make_client()
    owner_id = create_user(client)
    payload = {
        "owner_id": owner_id,
        "slug": "dpa",
        "agreement_name": "Data Processing Agreement",
        "values": {"provider_name": "OldCo"},
    }

    first = client.put("/api/documents/drafts/dpa", json=payload).json()
    payload["values"] = {"provider_name": "NewCo"}
    second = client.put("/api/documents/drafts/dpa", json=payload).json()

    assert second["id"] == first["id"]
    assert second["values"] == {"provider_name": "NewCo"}

    fastapi_app.dependency_overrides.clear()


def test_documents_are_scoped_by_owner():
    client = make_client()
    ava_id = create_user(client, "ava@example.com")
    ben_id = create_user(client, "ben@example.com")

    client.put(
        "/api/documents/drafts/mutual-nda",
        json={
            "owner_id": ava_id,
            "slug": "mutual-nda",
            "agreement_name": "Mutual NDA",
            "values": {"purpose": "Ava"},
        },
    )

    response = client.get(f"/api/documents?owner_id={ben_id}")

    assert response.status_code == 200
    assert response.json() == []

    fastapi_app.dependency_overrides.clear()


def test_record_and_delete_export():
    client = make_client()
    owner_id = create_user(client)

    export_response = client.post(
        "/api/documents/exports",
        json={
            "owner_id": owner_id,
            "slug": "pilot",
            "agreement_name": "Pilot Agreement",
            "file_name": "pilot-draft.pdf",
        },
    )

    assert export_response.status_code == 201
    export_id = export_response.json()["id"]
    assert export_response.json()["status"] == "exported"

    delete_response = client.delete(
        f"/api/documents/exports/{export_id}?owner_id={owner_id}"
    )

    assert delete_response.status_code == 204
    assert client.get(f"/api/documents?owner_id={owner_id}").json() == []

    fastapi_app.dependency_overrides.clear()


def test_unknown_owner_is_rejected():
    client = make_client()

    response = client.get("/api/documents?owner_id=missing")

    assert response.status_code == 404

    fastapi_app.dependency_overrides.clear()
