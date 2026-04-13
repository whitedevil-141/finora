from fastapi import APIRouter, Query
from database import get_supabase

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/summary")
async def get_summary(user_id: str = Query(..., description="User ID")):
    """
    Get aggregated financial summary:
    - Total income
    - Total expenses
    - Net flow
    - Total balance across accounts
    """
    sb = get_supabase()

    # Fetch all transactions
    txns = (
        sb.table("transactions")
        .select("amount, type")
        .eq("user_id", user_id)
        .execute()
    )

    total_income = sum(t["amount"] for t in txns.data if t["type"] == "income")
    total_expense = abs(sum(t["amount"] for t in txns.data if t["type"] == "expense"))
    net_flow = total_income - total_expense

    # Total balance from accounts
    accounts = (
        sb.table("accounts")
        .select("balance")
        .eq("user_id", user_id)
        .execute()
    )
    total_balance = sum(a["balance"] for a in accounts.data)

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_flow": net_flow,
        "total_balance": total_balance,
        "transaction_count": len(txns.data),
    }


@router.get("/by-category")
async def get_by_category(
    user_id: str = Query(..., description="User ID"),
    type: str = Query("expense", description="Transaction type to group"),
):
    """Get spending/income grouped by category, sorted by amount."""
    sb = get_supabase()

    txns = (
        sb.table("transactions")
        .select("amount, category")
        .eq("user_id", user_id)
        .eq("type", type)
        .execute()
    )

    # Aggregate by category
    by_category: dict[str, float] = {}
    for t in txns.data:
        cat = t["category"]
        by_category[cat] = by_category.get(cat, 0) + abs(t["amount"])

    # Sort descending by amount
    sorted_categories = sorted(by_category.items(), key=lambda x: x[1], reverse=True)

    return [
        {"category": cat, "total": amount}
        for cat, amount in sorted_categories
    ]
