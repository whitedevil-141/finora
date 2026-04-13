from fastapi import APIRouter, Query
from database import get_supabase
from models.category import CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("/", response_model=list[CategoryResponse])
async def list_categories(
    user_id: str | None = Query(None, description="User ID for custom categories"),
    type: str | None = Query(None, description="Filter by type: income or expense"),
):
    """
    List categories. Returns global defaults + user custom categories.
    """
    sb = get_supabase()

    # Get global categories (user_id is null) and user-specific ones
    if user_id:
        query = sb.table("categories").select("*").or_(
            f"user_id.is.null,user_id.eq.{user_id}"
        )
    else:
        query = sb.table("categories").select("*").is_("user_id", "null")

    if type:
        query = query.eq("type", type)

    result = query.order("name").execute()
    return result.data
