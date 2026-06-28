from pydantic import BaseModel, EmailStr, Field


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, max_length=100)
    company: str | None = Field(default=None, max_length=100)
    job_title: str | None = Field(default=None, max_length=100)
    bio: str | None = Field(default=None, max_length=1000)


class ContactMessage(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    subject: str | None = Field(default=None, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
