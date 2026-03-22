from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.models import User
from app.auth.schemas import (
    GoogleLoginRequest,
    ProfileUpdateRequest,
    RegisterRequest,
    UserResponse,
)
from app.auth.utils import login_user, register_user, authenticate_google_user
from app.database import get_db
from app.core.security import get_current_user

# ✅ DEFINE ROUTER FIRST
router = APIRouter(prefix="/auth", tags=["Authentication"])

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROFILE_UPLOAD_DIR = PROJECT_ROOT / "uploads" / "profile_pictures"
PROFILE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        profile_picture_url=user.profile_picture_url,
        business_name=user.business_name,
        business_type=user.business_type,
        auth_provider=user.auth_provider,
    )


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

@router.post("/google")
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        access_token = authenticate_google_user(db, payload.token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc)
        )
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
    }


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    for field in payload.model_fields_set:
        setattr(current_user, field, getattr(payload, field))

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user)


@router.post("/profile/picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, and WEBP images are allowed.",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if len(content) > MAX_PROFILE_IMAGE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile image must be 5MB or smaller.",
        )

    file_name = f"user_{current_user.id}_{uuid4().hex}{extension}"
    destination = PROFILE_UPLOAD_DIR / file_name
    destination.write_bytes(content)

    old_path = current_user.profile_picture_url or ""
    if old_path.startswith("/uploads/profile_pictures/"):
        old_file = PROJECT_ROOT / old_path.lstrip("/")
        if old_file.exists() and old_file.is_file():
            try:
                old_file.unlink()
            except OSError:
                pass

    current_user.profile_picture_url = f"/uploads/profile_pictures/{file_name}"
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user)