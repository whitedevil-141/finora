from pydantic import BaseModel
from datetime import datetime


class AccountBase(BaseModel):
    name: str
    balance: float = 0.0
    type: str = "checking"  # checking, savings, cash


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: str | None = None
    balance: float | None = None
    type: str | None = None
    is_synced: bool | None = None


class AccountResponse(AccountBase):
    id: str
    user_id: str
    is_synced: bool = True
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}
