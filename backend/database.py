from supabase import create_client, Client
from config import get_settings

_client: Client | None = None


def get_supabase() -> Client:
    """Get or create the Supabase client singleton."""
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(settings.supabase_url, "sb_publishable_kKZE-w9GUbEPQOa0C318Ww__wnyUV2D")
    return _client
