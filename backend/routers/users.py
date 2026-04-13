from fastapi import APIRouter, HTTPException, UploadFile, File
from database import get_supabase
from models.user import UserCreate, UserUpdate, UserResponse
from utils.image import compress_avatar, upload_avatar_public
from config import get_settings

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get user profile by ID."""
    sb = get_supabase()
    result = sb.table("users").select("*").eq("id", user_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return result.data[0]


@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """Create a new user profile."""
    sb = get_supabase()
    existing = (
        sb.table("users")
        .select("id")
        .eq("email", user.email)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    result = sb.table("users").insert(user.model_dump()).execute()

    if not result.data:
        duplicate_check = (
            sb.table("users")
            .select("id")
            .eq("email", user.email)
            .execute()
        )
        if duplicate_check.data:
            raise HTTPException(status_code=409, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Failed to create user")

    return result.data[0]


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, user: UserUpdate):
    """Update user profile settings."""
    sb = get_supabase()

    # Allow explicit avatar removal (avatar_url: null) while still ignoring other None fields
    update_data = user.model_dump(exclude_unset=True)
    if "avatar_url" in update_data:
        update_data = {k: v for k, v in update_data.items() if v is not None or k == "avatar_url"}
    else:
        update_data = {k: v for k, v in update_data.items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = (
        sb.table("users")
        .update(update_data)
        .eq("id", user_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")

    return result.data[0]


@router.post("/{user_id}/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...)):
    """
    Upload and process avatar image.

    - Accepts JPEG, PNG, WebP, GIF
    - Compresses and converts to WebP
    - Resizes to max 400x400px
    - Uploads to public image host (ImgBB)
    - Updates user profile with new avatar URL
    """
    settings = get_settings()
    sb = get_supabase()

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Allowed: {', '.join(allowed_types)}"
        )

    # Read and validate size
    image_bytes = await file.read()
    max_bytes = settings.avatar_max_upload_mb * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.avatar_max_upload_mb}MB"
        )

    # Compress and convert to WebP
    try:
        compressed_bytes, storage_filename = compress_avatar(
            image_bytes, file.filename or "avatar.jpg"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

    # Upload to public hosting
    try:
        public_url = await upload_avatar_public(compressed_bytes, storage_filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # Update user profile with new avatar URL
    sb.table("users").update({"avatar_url": public_url}).eq("id", user_id).execute()

    return {
        "avatar_url": public_url,
        "size_bytes": len(compressed_bytes),
        "original_size_bytes": len(image_bytes),
        "compression_ratio": f"{(1 - len(compressed_bytes) / len(image_bytes)) * 100:.1f}%"
    }
