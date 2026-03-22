from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    business_name: str | None = None
    business_type: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class GoogleLoginRequest(BaseModel):
    token: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    profile_picture_url: str | None = None
    business_name: str | None = None
    business_type: str | None = None
    auth_provider: str


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    business_name: str | None = None
    business_type: str | None = None
