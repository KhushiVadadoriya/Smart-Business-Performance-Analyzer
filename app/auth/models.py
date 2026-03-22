from sqlalchemy import Column, DateTime, Integer, String, func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    auth_provider = Column(String(50), default="local", nullable=False)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    
    # Profile & Business Information (Nullable)
    full_name = Column(String(255), nullable=True)
    profile_picture_url = Column(String(1024), nullable=True)
    business_name = Column(String(255), nullable=True)
    business_type = Column(String(100), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
