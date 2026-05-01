import os
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.auth.models import User
from app.auth.schemas import RegisterRequest
from app.core.security import create_access_token, get_password_hash, verify_password


def register_user(db: Session, payload: RegisterRequest) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise ValueError("Email is already registered.")

    user = User(
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        business_name=payload.business_name.strip() if payload.business_name else None,
        business_type=payload.business_type.strip() if payload.business_type else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise ValueError("Invalid email or password.")

    return create_access_token(subject=user.email)

def authenticate_google_user(db: Session, token: str) -> str:
    try:
        # Verify the token
        client_id = os.getenv("VITE_GOOGLE_CLIENT_ID") or os.getenv("GOOGLE_CLIENT_ID")
        clock_skew_in_seconds = int(os.getenv("GOOGLE_CLOCK_SKEW_SECONDS", "120"))
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            client_id,
            clock_skew_in_seconds=clock_skew_in_seconds,
        )

        email = idinfo.get("email")
        google_id = idinfo.get("sub")
        full_name = idinfo.get("name")
        picture = idinfo.get("picture")
        
        if not email:
            raise ValueError("Google token did not contain an email address.")
            
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            profile_changed = False

            # If they exist but signed up manually, update their google_id and provider
            if not user.google_id and google_id:
                user.google_id = google_id
                user.auth_provider = "google"
                profile_changed = True

            if full_name and user.full_name != full_name:
                user.full_name = full_name
                profile_changed = True

            if picture and user.profile_picture_url != picture:
                user.profile_picture_url = picture
                profile_changed = True

            if profile_changed:
                db.commit()
        else:
            # Create new user
            user = User(
                email=email,
                hashed_password=None, # Nullable for OAuth
                auth_provider="google",
                google_id=google_id,
                full_name=full_name,
                profile_picture_url=picture,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        return create_access_token(subject=user.email)

    except ValueError as exc:
        raise ValueError(f"Invalid Google token: {str(exc)}")
