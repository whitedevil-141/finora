from fastapi import APIRouter, HTTPException, Query, Depends
from database import get_supabase
from models.transaction import TransactionCreate, TransactionResponse
from utils.auth import get_current_user
from datetime import datetime

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("/", response_model=list[TransactionResponse])
async def list_transactions(
    type: str | None = Query(None, description="Filter by type: income or expense"),
    category: str | None = Query(None, description="Filter by category name"),
    limit: int = Query(50, ge=1, le=200, description="Max results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    current_user: dict = Depends(get_current_user),
):
    """List transactions with optional filters for the authenticated user."""
    sb = get_supabase()
    query = sb.table("transactions").select("*").eq("user_id", current_user["id"])

    if type:
        query = query.eq("type", type)
    if category:
        query = query.eq("category", category)

    result = (
        query
        .order("date", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data


@router.post("/", response_model=TransactionResponse, status_code=201)
async def create_transaction(txn: TransactionCreate, current_user: dict = Depends(get_current_user)):
    """
    Create a new transaction for the authenticated user.

    Also updates the associated account balance:
    - Expense: subtracts amount from account
    - Income: adds amount to account
    """
    sb = get_supabase()

    # Prepare transaction data
    txn_data = txn.model_dump()
    txn_data["user_id"] = current_user["id"]

    if txn_data.get("date") is None:
        txn_data["date"] = datetime.now().isoformat()
    else:
        txn_data["date"] = txn_data["date"].isoformat()

    txn_data["is_synced"] = True
    txn_data["pending"] = False

    # Insert transaction
    result = sb.table("transactions").insert(txn_data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create transaction")

    # Update account balance
    account_result = (
        sb.table("accounts")
        .select("balance")
        .eq("id", txn.account_id)
        .eq("user_id", current_user["id"])
        .execute()
    )

    if account_result.data:
        current_balance = account_result.data[0]["balance"]
        new_balance = current_balance + txn.amount  # amount is negative for expenses
        sb.table("accounts").update(
            {"balance": new_balance, "is_synced": False}
        ).eq("id", txn.account_id).execute()

    return result.data[0]


@router.delete("/{transaction_id}")
async def delete_transaction(transaction_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a transaction and reverse the account balance change."""
    sb = get_supabase()

    # Get the transaction first to reverse balance
    txn_result = (
        sb.table("transactions")
        .select("*")
        .eq("id", transaction_id)
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not txn_result.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn = txn_result.data[0]

    # Reverse account balance
    account_result = (
        sb.table("accounts")
        .select("balance")
        .eq("id", txn["account_id"])
        .execute()
    )

    if account_result.data:
        current_balance = account_result.data[0]["balance"]
        reversed_balance = current_balance - txn["amount"]
        sb.table("accounts").update(
            {"balance": reversed_balance}
        ).eq("id", txn["account_id"]).execute()

    # Delete the transaction
    sb.table("transactions").delete().eq("id", transaction_id).eq("user_id", current_user["id"]).execute()

    return {"message": "Transaction deleted", "id": transaction_id}
