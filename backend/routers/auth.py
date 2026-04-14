"""
Authentication router — email/password signup & login, Google OAuth2 with
server-side ID token verification, and JWT-protected /me endpoint.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from database import get_supabase
from config import get_settings
from utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from utils.image import cache_remote_avatar

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


# ── CORS Preflight Handler ─────────────────────────────────────────
@router.options("/{path:path}")
async def handle_cors_preflight(path: str):
    """Handle CORS preflight requests for all auth endpoints."""
    return {"status": "ok"}


# ── Request / Response schemas ─────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class GoogleTokenRequest(BaseModel):
    """Payload sent by the frontend after Google Identity Services callback.
    Contains the Google credential (ID token JWT) to be verified server-side."""
    credential: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


def _is_google_avatar(url: str | None) -> bool:
    if not url:
        return False
    return "googleusercontent.com" in url or "ggpht.com" in url


# ── Endpoints ──────────────────────────────────────────────────────

@router.post("/signup", response_model=AuthResponse)
async def signup(req: SignupRequest):
    """Register a new user with email + password."""
    sb = get_supabase()

    # Check for existing email
    existing = (
        sb.table("users")
        .select("id")
        .eq("email", req.email)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Hash password and insert
    hashed = hash_password(req.password)
    user_data = {
        "name": req.name,
        "email": req.email,
        "password_hash": hashed,
        "provider": "email",
        "avatar_url": f"https://api.dicebear.com/9.x/initials/svg?seed={req.name}&backgroundColor=7c3aed",
    }

    result = sb.table("users").insert(user_data).execute()
    if not result.data:
        # Handle race condition where the email was created after the initial check
        duplicate_check = (
            sb.table("users")
            .select("id")
            .eq("email", req.email)
            .execute()
        )
        if duplicate_check.data:
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Failed to create user")

    user = result.data[0]

    token = create_access_token({"sub": user["id"], "email": user["email"]})

    return AuthResponse(
        access_token=token,
        user=_safe_user(user),
    )


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest):
    """Log in with email + password."""
    sb = get_supabase()

    result = (
        sb.table("users")
        .select("*")
        .eq("email", req.email)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user = result.data[0]

    # Users who signed up via Google don't have a password
    if not user.get("password_hash"):
        raise HTTPException(
            status_code=401,
            detail="This account uses Google sign-in. Please use Google to log in.",
        )

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user["id"], "email": user["email"]})

    return AuthResponse(
        access_token=token,
        user=_safe_user(user),
    )


@router.post("/google", response_model=AuthResponse)
async def google_login(req: GoogleTokenRequest):
    """
    Handle Google OAuth2 login with server-side ID token verification.

    The frontend sends the Google credential (ID token JWT) obtained from
    Google Identity Services. The backend verifies it against Google's
    public keys and extracts the user's verified email, name, and avatar.

    If the email already exists we log them in; otherwise we create a new user.
    """
    settings = get_settings()

    # ── Verify the Google ID token ────────────────────────────────
    if not settings.google_client_id:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID in .env",
        )

    try:
        id_info = google_id_token.verify_oauth2_token(
            req.credential,
            google_requests.Request(),
            settings.google_client_id,
            clock_skew_in_seconds=10,
        )
    except ValueError as e:
        logger.warning(f"Google token verification failed: {e}")
        raise HTTPException(
            status_code=401,
            detail="Invalid Google credential. Please try again.",
        )

    # Extract verified user information from the token
    google_email = id_info.get("email")
    google_name = id_info.get("name", "")
    google_avatar = id_info.get("picture")
    google_sub = id_info.get("sub")  # Google's unique user ID

    if not google_email:
        raise HTTPException(status_code=401, detail="Google account has no email")

    if not id_info.get("email_verified"):
        raise HTTPException(status_code=401, detail="Google email is not verified")

    # ── Find or create user ───────────────────────────────────────
    sb = get_supabase()

    existing = (
        sb.table("users")
        .select("*")
        .eq("email", google_email)
        .execute()
    )

    if existing.data:
        user = existing.data[0]
        # Update avatar from Google if user doesn't have one or it's a placeholder
        updates = {}
        if google_avatar and (
            not user.get("avatar_url")
            or "dicebear" in (user.get("avatar_url") or "")
            or _is_google_avatar(user.get("avatar_url"))
        ):
            try:
                cached_url = await cache_remote_avatar(google_avatar, f"avatar_{google_sub}")
                updates["avatar_url"] = cached_url
            except Exception:
                updates["avatar_url"] = google_avatar
        if updates:
            sb.table("users").update(updates).eq("id", user["id"]).execute()
            user.update(updates)
    else:
        # First-time Google user — create account
        cached_avatar = None
        if google_avatar:
            try:
                cached_avatar = await cache_remote_avatar(google_avatar, f"avatar_{google_sub}")
            except Exception:
                cached_avatar = None
        user_data = {
            "name": google_name,
            "email": google_email,
            "provider": "google",
            "avatar_url": cached_avatar or google_avatar or f"https://api.dicebear.com/9.x/initials/svg?seed={google_name}&backgroundColor=7c3aed",
        }
        result = sb.table("users").insert(user_data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        user = result.data[0]

    token = create_access_token({"sub": user["id"], "email": user["email"]})

    return AuthResponse(
        access_token=token,
        user=_safe_user(user),
    )


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    user = current_user
    avatar_url = user.get("avatar_url")

    if user.get("provider") == "google" and _is_google_avatar(avatar_url):
        try:
            cached_url = await cache_remote_avatar(avatar_url, f"avatar_{user.get('id', 'user')}")
            sb = get_supabase()
            sb.table("users").update({"avatar_url": cached_url}).eq("id", user["id"]).execute()
            user = {**user, "avatar_url": cached_url}
        except Exception:
            pass

    return _safe_user(user)


# ── Helpers ────────────────────────────────────────────────────────

def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning user data."""
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "avatar_url": user.get("avatar_url"),
        "provider": user.get("provider", "email"),
        "currency": user.get("currency", "BDT"),
        "theme_preference": user.get("theme_preference", "dark"),
        "created_at": user.get("created_at"),
    }
