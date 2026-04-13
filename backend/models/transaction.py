from pydantic import BaseModel
from datetime import datetime


class TransactionBase(BaseModel):
    account_id: str
    amount: float
    category: str
    title: str
    type: str  # income, expense
    date: datetime | None = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    is_synced: bool = True
    pending: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}
