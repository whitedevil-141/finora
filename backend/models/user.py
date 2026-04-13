from pydantic import BaseModel, Field
from datetime import datetime


class UserBase(BaseModel):
    name: str = "John Doe"
    email: str = "john.doe@finspace.app"
    currency: str = "BDT"
    notifications: bool = True
    app_lock: bool = True
    theme_preference: str = "dark"


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    currency: str | None = None
    notifications: bool | None = None
    app_lock: bool | None = None
    avatar_url: str | None = None
    theme_preference: str | None = None


class UserResponse(UserBase):
    id: str
    avatar_url: str | None = None
    provider: str = "email"
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
