from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    type: str  # income, expense
    icon: str


class CategoryCreate(CategoryBase):
    id: str
    user_id: str | None = None  # None = default global category


class CategoryResponse(CategoryBase):
    id: str
    user_id: str | None = None

    model_config = {"from_attributes": True}
