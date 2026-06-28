from pydantic import BaseModel, EmailStr, Field


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=100)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    access_token: str | None = None
    refresh_token: str | None = None
    user_id: str | None = None
    email: str | None = None
    message: str | None = None
