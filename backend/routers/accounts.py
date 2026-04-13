from fastapi import APIRouter, HTTPException, Query, Depends
from database import get_supabase
from models.account import AccountCreate, AccountUpdate, AccountResponse
from utils.auth import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get("/", response_model=list[AccountResponse])
async def list_accounts(current_user: dict = Depends(get_current_user)):
    """List all accounts for the authenticated user."""
    sb = get_supabase()
    result = (
        sb.table("accounts")
        .select("*")
        .eq("user_id", current_user["id"])
        .order("created_at", desc=False)
        .execute()
    )
    return result.data


@router.post("/", response_model=AccountResponse, status_code=201)
async def create_account(account: AccountCreate, current_user: dict = Depends(get_current_user)):
    """Create a new account/asset for the authenticated user."""
    sb = get_supabase()
    data = account.model_dump()
    data["user_id"] = current_user["id"]
    result = sb.table("accounts").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create account")

    return result.data[0]


@router.put("/{account_id}", response_model=AccountResponse)
async def update_account(account_id: str, account: AccountUpdate, current_user: dict = Depends(get_current_user)):
    """Update an account (name, balance, type, sync status)."""
    sb = get_supabase()

    update_data = {k: v for k, v in account.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        sb.table("accounts")
        .update(update_data)
        .eq("id", account_id)
        .eq("user_id", current_user["id"])
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Account not found")

    return result.data[0]


@router.delete("/{account_id}")
async def delete_account(account_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an account and its transactions."""
    sb = get_supabase()

    # Delete associated transactions first
    sb.table("transactions").delete().eq("account_id", account_id).eq("user_id", current_user["id"]).execute()

    # Delete the account
    result = sb.table("accounts").delete().eq("id", account_id).eq("user_id", current_user["id"]).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Account not found")

    return {"message": "Account deleted", "id": account_id}


@router.delete("/")
async def delete_all_accounts(current_user: dict = Depends(get_current_user)):
    """Delete all accounts and transactions for the authenticated user."""
    sb = get_supabase()
    user_id = current_user["id"]

    # Delete all transactions for this user
    sb.table("transactions").delete().eq("user_id", user_id).execute()

    # Delete all accounts for this user
    result = sb.table("accounts").delete().eq("user_id", user_id).execute()

    return {"message": "All accounts and transactions deleted", "user_id": user_id}
