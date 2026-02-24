from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.schemas import RegisterRequest
from app.auth.utils import login_user, register_user
from app.database import get_db

# ✅ DEFINE ROUTER FIRST
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    try:
        register_user(db, payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )

    return {"message": "User registered successfully."}


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    try:
        access_token = login_user(
            db,
            email=form_data.username,
            password=form_data.password,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
    }