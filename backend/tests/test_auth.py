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


def test_signup_creates_user():
    client = make_client()

    response = client.post(
        "/api/auth/signup",
        json={"email": "User@Example.com", "password": "secret"},
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": "local:user-example-com",
        "email": "user@example.com",
    }

    fastapi_app.dependency_overrides.clear()


def test_signin_returns_existing_user():
    client = make_client()
    client.post(
        "/api/auth/signup",
        json={"email": "user@example.com", "password": "secret"},
    )

    response = client.post(
        "/api/auth/signin",
        json={"email": "USER@example.com", "password": "secret"},
    )

    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"

    fastapi_app.dependency_overrides.clear()


def test_signin_rejects_invalid_password():
    client = make_client()
    client.post(
        "/api/auth/signup",
        json={"email": "user@example.com", "password": "secret"},
    )

    response = client.post(
        "/api/auth/signin",
        json={"email": "user@example.com", "password": "wrong"},
    )

    assert response.status_code == 401

    fastapi_app.dependency_overrides.clear()


def test_signup_rejects_duplicate_email():
    client = make_client()
    payload = {"email": "user@example.com", "password": "secret"}
    client.post("/api/auth/signup", json=payload)

    response = client.post("/api/auth/signup", json=payload)

    assert response.status_code == 409

    fastapi_app.dependency_overrides.clear()
