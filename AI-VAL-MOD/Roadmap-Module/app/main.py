import os
import sys
from pathlib import Path

# /app/Roadmap-Module/app/main.py
# parents[0] = /app/Roadmap-Module/app  ← module's own app dir (for schema, workflow, services)
# parents[2] = /app                     ← AI-VAL-MOD root (for shared package)
_here = Path(__file__).resolve()
sys.path.insert(0, str(_here.parent))       # Roadmap-Module/app
sys.path.insert(0, str(_here.parents[2]))   # AI-VAL-MOD (shared lives here)

import logging
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from schema.states.pipeline_state import RoadmapPipelineState, TeamMember
from workflow.pipeline import run_roadmap_pipeline
from services.db.reader import (
    get_sessions_by_user,
    get_validated_sessions_by_user,
    get_latest_validated_session,
    get_roadmap_profiler,
    get_roadmap_branches,
    get_roadmap_tasks,
    get_pipeline_output,
)
from services.db.writer import update_branch, update_task

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Startup Roadmap Generator", version="2.0.0")

# ─── 1. STANDARD CORS MIDDLEWARE ──────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost(:\d+)?|startup-xpert\.vercel\.app|startup-xpert-.*\.vercel\.app)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def _validation_error(request: Request, exc: RequestValidationError):
    errors = [{"field": " -> ".join(str(l) for l in e["loc"] if l != "body"), "issue": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"status": "invalid_input", "errors": errors})


@app.exception_handler(Exception)
async def _global_error(request: Request, exc: Exception):
    """Ensure CORS headers are present even on 500 errors."""
    logger.exception(f"[API] Unhandled error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
    )


class RoadmapRequest(BaseModel):
    session_id: str          # startup_input.id from Validation Module DB
    team: List[TeamMember] = []


class BranchUpdateRequest(BaseModel):
    status:  Optional[str] = None
    summary: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    dep_status:          Optional[str]      = None
    priority:            Optional[str]      = None
    assigned_to:         Optional[str]      = None
    assignee_role:       Optional[str]      = None
    assigned_member_id:  Optional[str]      = None
    title:               Optional[str]      = None
    description:         Optional[str]      = None
    timeline:            Optional[str]      = None
    estimated_hours:     Optional[int]      = None
    complexity:          Optional[str]      = None
    cost_impact:         Optional[str]      = None
    blocked_by:          Optional[List[str]] = None
    unblocks:            Optional[List[str]] = None


@app.get("/health")
def health():
    return {"status": "active", "module": "roadmap"}


# Debug endpoint — only available in non-production environments
@app.get("/api/v1/debug/session/{session_id}")
def debug_session(session_id: str):
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")
    from services.db.reader import get_startup_input
    row = get_startup_input(session_id)
    return {
        "session_id":      session_id,
        "found":           row is not None,
        "startup_name":    row.get("startup_name") if row else None,
        "has_service_key": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY")),
    }


@app.post("/api/v1/roadmap")
async def generate_roadmap(payload: RoadmapRequest):
    try:
        return await run_roadmap_pipeline(
            session_id=   payload.session_id,
            team_members= [m.model_dump() for m in payload.team],
        )
    except ValueError as e:
        msg = str(e)
        # Only treat "not found" ValueErrors as 404; everything else is a 500
        if "not found" in msg.lower() or "no startup_input" in msg.lower():
            raise HTTPException(status_code=404, detail=msg)
        logger.exception("[API] pipeline ValueError (not a 404)")
        raise HTTPException(status_code=500, detail=msg)
    except Exception as e:
        logger.exception("[API] roadmap generation failed")
        raise HTTPException(status_code=500, detail=str(e))


# ── User-scoped idea & roadmap queries ────────────────────────────────────────

@app.get("/api/v1/sessions/{user_id}")
def get_user_sessions(user_id: str):
    """Return all startup_input sessions for a user, with validation status."""
    try:
        return get_validated_sessions_by_user(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/sessions/{user_id}/latest")
def get_user_latest_session(user_id: str):
    """Return the most recent completed validation session for a user."""
    try:
        session = get_latest_validated_session(user_id)
        return {"found": session is not None, "session": session}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/roadmap/{session_id}")
def get_session_roadmap(session_id: str):
    """Return full roadmap (profiler + branches + tasks) for a validated session."""
    profiler = get_roadmap_profiler(session_id)
    if not profiler:
        raise HTTPException(status_code=404, detail="No roadmap found for this session.")

    branches = get_roadmap_branches(session_id)
    result = []
    for branch in branches:
        tasks = get_roadmap_tasks(branch["id"])
        result.append({**branch, "tasks": tasks})

    pipeline = get_pipeline_output(session_id)

    return {
        "session_id":       session_id,
        "profiler":         profiler,
        "branches":         result,
        "pipeline_output":  pipeline,
    }


# ── Node edit → DB sync endpoints ─────────────────────────────────────────────

@app.patch("/api/v1/branches/{branch_id}")
def patch_branch(branch_id: str, payload: BranchUpdateRequest):
    """Sync a branch status/summary edit from the frontend to Supabase."""
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = update_branch(branch_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Branch not found or update failed.")
    return {"status": "updated", "branch": updated}


@app.patch("/api/v1/tasks/{task_id}")
def patch_task(task_id: str, payload: TaskUpdateRequest):
    """Sync a task edit from the frontend to Supabase."""
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update.")
    updated = update_task(task_id, fields)
    if not updated:
        raise HTTPException(status_code=404, detail="Task not found or update failed.")
    return {"status": "updated", "task": updated}


class AddMemberRequest(BaseModel):
    org_id: str
    email: str
    full_name: str
    role: str
    skills: List[str] = []


@app.post("/api/v1/organizations/members")
def add_org_member(payload: AddMemberRequest):
    """Invite or add a member to the organization."""
    from shared.db.supabase_client import get_supabase
    supabase = get_supabase()

    email_clean = payload.email.strip().lower()

    # 1. Search auth.users for this email
    try:
        users_res = supabase.auth.admin.list_users()
        target_user = None
        for u in users_res:
            if u.email and u.email.strip().lower() == email_clean:
                target_user = u
                break
    except Exception as e:
        logger.error(f"Error checking auth users: {e}")
        raise HTTPException(status_code=500, detail="Failed to search auth users.")

    user_id = None
    if target_user:
        user_id = target_user.id
        logger.info(f"User {email_clean} exists with ID {user_id}")
    else:
        # Create user
        import secrets
        temp_pwd = secrets.token_urlsafe(12)
        try:
            new_user = supabase.auth.admin.create_user({
                "email": email_clean,
                "password": temp_pwd,
                "email_confirm": True,
                "user_metadata": { "full_name": payload.full_name }
            })
            user_id = new_user.user.id
            logger.info(f"Created new user {email_clean} with ID {user_id}")
        except Exception as e:
            logger.error(f"Failed to create new user: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create user account: {e}")

    # 2. Check if already in org_members
    try:
        existing = supabase.table("org_members")\
            .select("id")\
            .eq("org_id", payload.org_id)\
            .eq("user_id", user_id)\
            .execute()
        if existing.data:
            # Already a member, update role/skills
            supabase.table("org_members")\
                .update({
                    "full_name": payload.full_name,
                    "job_title": payload.role,
                    "skills": payload.skills
                })\
                .eq("id", existing.data[0]["id"])\
                .execute()
            return {"status": "updated", "member_id": existing.data[0]["id"]}
    except Exception as e:
        logger.error(f"Error checking/updating member: {e}")

    # 3. Insert into org_members
    try:
        res = supabase.table("org_members").insert({
            "org_id": payload.org_id,
            "user_id": user_id,
            "role": "member",
            "full_name": payload.full_name,
            "job_title": payload.role,
            "skills": payload.skills
        }).execute()
        if res.data:
            return {"status": "added", "member": res.data[0]}
        raise Exception("No data returned from insert")
    except Exception as e:
        logger.error(f"Failed to insert org member: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add member to organization: {e}")


@app.get("/api/v1/organizations/my-org/{user_id}")
def get_my_organization_backend(user_id: str):
    """Get organization and member list including emails, using the admin client."""
    from shared.db.supabase_client import get_supabase
    supabase = get_supabase()

    try:
        # 1. Fetch user membership
        membership = supabase.table("org_members")\
            .select("org_id, role, full_name, job_title, skills")\
            .eq("user_id", user_id)\
            .order("joined_at", { "ascending": True })\
            .limit(1)\
            .maybeSingle()\
            .execute()
        
        if not membership or not membership.data:
            return {"org": None, "myRole": None, "members": []}
        
        m_data = membership.data
        org_id = m_data["org_id"]
        my_role = m_data["role"]

        # 2. Fetch organization info
        org = supabase.table("organizations")\
            .select("id, name, domain, invite_code")\
            .eq("id", org_id)\
            .single()\
            .execute()
        
        if not org or not org.data:
            return {"org": None, "myRole": None, "members": []}

        # 3. Fetch all members
        members_res = supabase.table("org_members")\
            .select("id, user_id, role, full_name, job_title, skills, joined_at")\
            .eq("org_id", org_id)\
            .order("joined_at", { "ascending": True })\
            .execute()
        
        members = members_res.data or []

        # 4. Fetch emails of all members using admin.list_users()
        email_map = {}
        try:
            users_res = supabase.auth.admin.list_users()
            for u in users_res:
                if u.id:
                    email_map[u.id] = u.email
        except Exception as auth_err:
            logger.error(f"Error fetching auth users for emails: {auth_err}")

        # Fetch active task count for each member ID
        member_ids = [m.get("id") for m in members]
        task_counts = {}
        if member_ids:
            try:
                tasks_res = supabase.table("roadmap_tasks")\
                    .select("assigned_member_id")\
                    .in_("assigned_member_id", member_ids)\
                    .execute()
                for t in (tasks_res.data or []):
                    mid = t.get("assigned_member_id")
                    if mid:
                        task_counts[mid] = task_counts.get(mid, 0) + 1
            except Exception as task_err:
                logger.error(f"Error querying task counts: {task_err}")

        # 5. Enrich members list with email and task_count
        enriched_members = []
        for m in members:
            uid = m.get("user_id")
            email = email_map.get(uid) or ""
            mid = m.get("id")
            enriched_members.append({
                "id": mid,
                "user_id": uid,
                "role": m.get("role"),
                "full_name": m.get("full_name"),
                "job_title": m.get("job_title"),
                "skills": m.get("skills") or [],
                "joined_at": m.get("joined_at"),
                "email": email,
                "task_count": task_counts.get(mid, 0)
            })

        return {
            "org": org.data,
            "myRole": my_role,
            "members": enriched_members
        }

    except Exception as e:
        logger.error(f"Error in get_my_organization_backend: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/tasks/member/{user_id}")
def get_member_tasks_backend(user_id: str):
    """Retrieve tasks assigned to a member across all startups."""
    from shared.db.supabase_client import get_supabase
    supabase = get_supabase()

    try:
        # 1. Get all matching org_member IDs for this user
        members_res = supabase.table("org_members")\
            .select("id, org_id")\
            .eq("user_id", user_id)\
            .execute()
        
        memberships = members_res.data or []
        if not memberships:
            return []
        
        member_ids = [m["id"] for m in memberships]

        # 2. Fetch tasks assigned to these member IDs
        tasks_res = supabase.table("roadmap_tasks")\
            .select("""
                id, task_id, title, description, timeline, priority,
                dep_status, complexity, cost_impact, completed_at, completion_note,
                branch_id
            """)\
            .in_("assigned_member_id", member_ids)\
            .execute()
        
        tasks = tasks_res.data or []
        if not tasks:
            return []

        # 3. Fetch branches and profilers to merge startup/branch names
        branch_ids = list(set([t["branch_id"] for t in tasks if t.get("branch_id")]))
        if not branch_ids:
            return []

        branches_res = supabase.table("roadmap_branches")\
            .select("id, branch, session_id")\
            .in_("id", branch_ids)\
            .execute()
        
        branches = branches_res.data or []
        session_ids = list(set([b["session_id"] for b in branches if b.get("session_id")]))

        profilers_res = supabase.table("roadmap_profiler")\
            .select("session_id, startup_name")\
            .in_("session_id", session_ids)\
            .execute()
        
        profilers = profilers_res.data or []
        
        # Mappings
        branch_map = {b["id"]: b for b in branches}
        profiler_map = {p["session_id"]: p for p in profilers}

        enriched_tasks = []
        for t in tasks:
            bid = t.get("branch_id")
            branch_info = branch_map.get(bid) or {}
            sid = branch_info.get("session_id")
            profiler_info = profiler_map.get(sid) or {}

            enriched_tasks.append({
                "id": t.get("id"),
                "taskId": t.get("task_id"),
                "title": t.get("title"),
                "description": t.get("description"),
                "timeline": t.get("timeline"),
                "priority": t.get("priority"),
                "status": t.get("dep_status") or "Pending",
                "complexity": t.get("complexity"),
                "costImpact": t.get("cost_impact"),
                "completedAt": t.get("completed_at"),
                "completionNote": t.get("completion_note"),
                "branch": branch_info.get("branch", "").replace("_", " ").title() if branch_info.get("branch") else "",
                "startupName": profiler_info.get("startup_name") or "Startup",
                "sessionId": sid
            })

        return enriched_tasks
    except Exception as e:
        logger.error(f"Error in get_member_tasks_backend: {e}")
        raise HTTPException(status_code=500, detail=str(e))

