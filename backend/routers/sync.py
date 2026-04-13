from fastapi import APIRouter, Depends
from database import get_supabase
from utils.auth import get_current_user

router = APIRouter(prefix="/api/sync", tags=["Sync"])


@router.post("/")
async def sync_data(current_user: dict = Depends(get_current_user)):
    """
    Mark all unsynced transactions and accounts as synced
    for the authenticated user.
    """
    sb = get_supabase()
    user_id = current_user["id"]

    # Sync transactions
    txn_result = (
        sb.table("transactions")
        .update({"is_synced": True, "pending": False})
        .eq("user_id", user_id)
        .eq("is_synced", False)
        .execute()
    )

    # Sync accounts
    acc_result = (
        sb.table("accounts")
        .update({"is_synced": True})
        .eq("user_id", user_id)
        .eq("is_synced", False)
        .execute()
    )

    synced_transactions = len(txn_result.data) if txn_result.data else 0
    synced_accounts = len(acc_result.data) if acc_result.data else 0

    return {
        "message": "Sync complete",
        "synced_transactions": synced_transactions,
        "synced_accounts": synced_accounts,
    }
