from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth_service import AuthError, signup_user, signin_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class UserResponse(BaseModel):
    id: str
    email: str


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(request: AuthRequest, db: Session = Depends(get_db)) -> UserResponse:
    try:
        user = signup_user(db, request.email, request.password)
    except AuthError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(error))

    return UserResponse(id=user.id, email=user.email)


@router.post("/signin", response_model=UserResponse)
def signin(request: AuthRequest, db: Session = Depends(get_db)) -> UserResponse:
    try:
        user = signin_user(db, request.email, request.password)
    except AuthError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(error))

    return UserResponse(id=user.id, email=user.email)
