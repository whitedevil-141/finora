from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_settings
from database import get_supabase

from routers import auth, users, accounts, transactions, categories, analytics, sync


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    # Startup: verify Supabase connection
    settings = get_settings()
    try:
        sb = get_supabase()
        print(f"[OK] Connected to Supabase: {settings.supabase_url}")
    except Exception as e:
        print(f"[WARNING] Supabase connection failed: {e}")
        print(f"[WARNING] Continuing in degraded mode without Supabase")
    
    print(f"[OK] Avatar upload provider: {settings.avatar_upload_provider}")
    print(f"[OK] CORS origins: {settings.cors_origins}")

    yield

    # Shutdown
    print("Shutting down Finora API...")


app = FastAPI(
    title="Finora API",
    description="Personal finance tracker backend — accounts, transactions, analytics, and avatar management.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS for frontend
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(analytics.router)
app.include_router(sync.router)


@app.get("/", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "Finora API",
        "version": "1.0.0",
    }


@app.get("/api/health", tags=["Health"])
async def api_health():
    """Test Supabase connectivity."""
    try:
        sb = get_supabase()
        # Simple query to verify connection
        result = sb.table("users").select("id").limit(1).execute()
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}
