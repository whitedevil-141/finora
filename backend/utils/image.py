import base64
import io
import uuid

import httpx
from PIL import Image

from config import get_settings


def compress_avatar(image_bytes: bytes, filename: str) -> tuple[bytes, str]:
    """
    Compress and resize an avatar image to WebP format.

    Args:
        image_bytes: Raw image bytes from upload
        filename: Original filename (used for generating storage name)

    Returns:
        Tuple of (compressed_bytes, storage_filename)
    """
    settings = get_settings()

    # Open the image
    img = Image.open(io.BytesIO(image_bytes))

    # Convert RGBA to RGB if necessary (WebP supports both, but RGB is smaller)
    if img.mode in ("RGBA", "LA", "P"):
        # Create white background for transparent images
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    # Resize if larger than max size (maintain aspect ratio)
    max_size = settings.avatar_max_size
    if img.width > max_size or img.height > max_size:
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

    # Compress to WebP
    buffer = io.BytesIO()
    img.save(buffer, format="WEBP", quality=settings.avatar_quality, method=6)
    compressed_bytes = buffer.getvalue()

    # Generate unique filename
    unique_id = uuid.uuid4().hex[:12]
    storage_filename = f"avatar_{unique_id}.webp"

    return compressed_bytes, storage_filename


async def upload_avatar_public(image_bytes: bytes, filename: str) -> str:
    """
    Upload avatar image bytes to a public hosting provider (ImgBB).

    Returns the public URL of the uploaded image.
    """
    settings = get_settings()
    provider = settings.avatar_upload_provider.lower()

    if provider != "imgbb":
        raise RuntimeError(f"Unsupported avatar upload provider: {provider}")
    if not settings.imgbb_api_key:
        raise RuntimeError("IMGBB_API_KEY is not configured")

    encoded = base64.b64encode(image_bytes).decode("ascii")
    payload = {
        "key": settings.imgbb_api_key,
        "image": encoded,
        "name": filename.rsplit(".", 1)[0],
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(settings.imgbb_api_url, data=payload)

    if response.status_code >= 400:
        raise RuntimeError(f"ImgBB upload failed with status {response.status_code}")

    data = response.json()
    if not data.get("success"):
        error_message = data.get("error", {}).get("message", "ImgBB upload failed")
        raise RuntimeError(error_message)

    image_data = data.get("data", {})
    public_url = image_data.get("display_url") or image_data.get("url")
    if not public_url:
        raise RuntimeError("ImgBB response missing image URL")

    return public_url


async def cache_remote_avatar(image_url: str, filename_hint: str) -> str:
    """
    Fetch a remote avatar image, compress to WebP, and upload it to the
    configured public hosting provider. Returns the public URL.
    """
    settings = get_settings()

    headers = {
        "User-Agent": "FinoraAvatarCache/1.0",
        "Accept": "image/*",
    }

    async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
        response = await client.get(image_url, headers=headers)

    if response.status_code >= 400:
        raise RuntimeError(f"Remote avatar fetch failed with status {response.status_code}")

    image_bytes = response.content
    max_bytes = settings.avatar_max_upload_mb * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise RuntimeError("Remote avatar exceeds max upload size")

    compressed_bytes, storage_filename = compress_avatar(image_bytes, filename_hint)
    return await upload_avatar_public(compressed_bytes, storage_filename)
