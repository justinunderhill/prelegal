from __future__ import annotations

import hashlib
import hmac
import os
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.models import User

HASH_ITERATIONS = 210_000


class AuthError(ValueError):
    pass


@dataclass(frozen=True)
class AuthUser:
    id: str
    email: str


def normalize_email(email: str) -> str:
    return email.strip().lower()


def local_user_id(email: str) -> str:
    safe = "".join(char if char.isalnum() else "-" for char in normalize_email(email)).strip("-")
    return f"local:{safe}"


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        HASH_ITERATIONS,
    )
    return f"pbkdf2_sha256${HASH_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    expected = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt_hex),
        int(iterations),
    ).hex()
    return hmac.compare_digest(expected, digest_hex)


def signup_user(db: Session, email: str, password: str) -> AuthUser:
    normalized_email = normalize_email(email)
    if not normalized_email or not password:
        raise AuthError("Email and password are required.")

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise AuthError("An account already exists for this email.")

    user = User(
        id=local_user_id(normalized_email),
        email=normalized_email,
        password_hash=hash_password(password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthUser(id=user.id, email=user.email)


def signin_user(db: Session, email: str, password: str) -> AuthUser:
    normalized_email = normalize_email(email)
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(password, user.password_hash):
        raise AuthError("Invalid email or password.")

    return AuthUser(id=user.id, email=user.email)
