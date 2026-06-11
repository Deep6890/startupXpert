import os
import sys
from pathlib import Path

# /app/Validation-Module/app/main.py
_here = Path(__file__).resolve()
sys.path.insert(0, str(_here.parent))       # Validation-Module/app
sys.path.insert(0, str(_here.parents[2]))   # AI-VAL-MOD (shared lives here)

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from schema.startup_input import StartupInput
from workflow.graph import run_pipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    async def _warmup():
        try:
            logger.info("[Startup] Warming up vector store model (background)...")
            from services.vector.store import vector_store
            await asyncio.get_running_loop().run_in_executor(None, lambda: (
                vector_store.add("warmup", {"agent": "warmup"}),
                vector_store.clear()
            ))
            logger.info("[Startup] Model ready")
        except Exception as e:
            logger.warning(f"[Startup] Model warmup failed (non-fatal): {e}")
    asyncio.create_task(_warmup())
    yield


app = FastAPI(title="AI Startup Validator", version="2.0.0", lifespan=lifespan)

# ─── 1. STANDARD CORS MIDDLEWARE ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost(:\d+)?|startup-xpert\.vercel\.app|startup-xpert-.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── 2. EXCEPTION HANDLERS ────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    errors = [{"field": " -> ".join(str(l) for l in e["loc"] if l != "body"), "issue": e["msg"]} for e in exc.errors()]
    return JSONResponse(
        status_code=422,
        content={"status": "invalid_input", "errors": errors},
    )


@app.exception_handler(Exception)
async def _global_error(request: Request, exc: Exception):
    logger.exception(f"[API] Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


# ─── 3. ROUTES ────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "active"}


# IMPORTANT: response_model removed — Pydantic schema mismatch crash se CORS strip hota tha
@app.post("/api/v1/validate")
async def validate(startup_data: StartupInput):
    try:
        return await run_pipeline(startup_data)
    except Exception as e:
        logger.error(f"[API] Validation pipeline error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)},
        )


from fastapi import Depends
from shared.core.auth import get_current_user

@app.get("/api/v1/sessions/{user_id}")
def get_user_sessions(user_id: str, current_user=Depends(get_current_user)):
    """Return all startup_input session IDs + metadata for a user."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        from shared.db.supabase_client import get_supabase
        res = get_supabase().table("startup_input") \
            .select("id, created_at, startup_name, startup_domain, current_startup_stage") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/sessions/{user_id}/latest")
def get_latest_session(user_id: str, current_user=Depends(get_current_user)):
    """Return the most recent validated session for a user."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        from shared.db.supabase_client import get_supabase
        db = get_supabase()
        sessions = db.table("startup_input") \
            .select("id, created_at, startup_name, startup_domain") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute().data or []
        if not sessions:
            return {"found": False, "session": None}
        ids = [s["id"] for s in sessions]
        po = db.table("pipeline_output") \
            .select("session_id, aggregate_validation_score, status") \
            .in_("session_id", ids) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute().data or []
        if not po:
            return {"found": False, "session": None}
        session_id = po[0]["session_id"]
        session = next((s for s in sessions if s["id"] == session_id), None)
        return {
            "found": True,
            "session": {
                **session,
                "aggregate_validation_score": po[0].get("aggregate_validation_score"),
                "status": po[0].get("status"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/vector/search")
def vector_search(query: str, top_k: int = 5, agent: str = None):
    from services.vector.store import vector_store
    return {"query": query, "results": vector_store.search(query=query, top_k=top_k, agent_filter=agent)}


@app.get("/api/v1/vector/stats")
def vector_stats():
    from services.vector.store import vector_store
    return vector_store.stats()


@app.delete("/api/v1/vector/clear")
def vector_clear():
    from services.vector.store import vector_store
    vector_store.clear()
    return {"status": "cleared"}