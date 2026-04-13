from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    supabase_url: str
    supabase_key: str
    supabase_storage_bucket: str = "avatars"

    # Avatar upload (public hosting)
    avatar_upload_provider: str = "imgbb"
    imgbb_api_key: str = "7f12b2d29adb8e7a43c0bfb6c5193038"
    imgbb_api_url: str = "https://api.imgbb.com/1/upload"

    # JWT Authentication
    jwt_secret: str = "finora-dev-secret-change-in-production"
    jwt_expire_days: int = 30

    # Google OAuth2
    google_client_id: str = ""

    # Image processing
    avatar_max_size: int = 400  # Max width/height in pixels
    avatar_quality: int = 80    # WebP quality (1-100)
    avatar_max_upload_mb: int = 5  # Max upload size in MB

    # CORS
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://192.168.10.139:5173",
    ]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
