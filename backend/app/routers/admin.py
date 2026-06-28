import logging
from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.dependencies import require_admin
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["Admin"])


class RoleUpdate(BaseModel):
    role: Literal["user", "admin"]


class PlanUpdate(BaseModel):
    plan: Literal["free", "student", "professional", "enterprise"]


@router.get("/stats")
async def admin_stats(_admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    users = sb.table("profiles").select("id, created_at").execute()
    uploads = sb.table("uploads").select("id, created_at").execute()
    reports = sb.table("reports").select("id, fabric_type, created_at").execute()
    subs = sb.table("subscriptions").select("plan, status").execute()
    contacts = sb.table("contact_messages").select("id").execute()

    plan_counts: dict[str, int] = {}
    for s in subs.data or []:
        plan = s.get("plan", "free")
        plan_counts[plan] = plan_counts.get(plan, 0) + 1

    fabric_counts: dict[str, int] = {}
    for r in reports.data or []:
        ft = r.get("fabric_type") or "Unknown"
        fabric_counts[ft] = fabric_counts.get(ft, 0) + 1

    return {
        "total_users": len(users.data or []),
        "total_uploads": len(uploads.data or []),
        "total_reports": len(reports.data or []),
        "total_contacts": len(contacts.data or []),
        "plan_distribution": plan_counts,
        "fabric_distribution": fabric_counts,
    }


@router.get("/users")
async def list_users(_admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    profiles = sb.table("profiles").select("*").execute()
    roles = sb.table("user_roles").select("*").execute()
    subs = sb.table("subscriptions").select("*").execute()

    users = []
    for p in profiles.data or []:
        role = next((r["role"] for r in roles.data or [] if r["user_id"] == p["id"]), "user")
        sub = next((s for s in subs.data or [] if s["user_id"] == p["id"]), {"plan": "free", "status": "active"})
        users.append({**p, "role": role, "plan": sub.get("plan"), "sub_status": sub.get("status")})
    return {"users": users}


@router.patch("/users/{user_id}/role")
async def update_role(user_id: str, body: RoleUpdate, admin: Annotated[dict, Depends(require_admin)]):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    sb = get_supabase()
    sb.table("user_roles").delete().eq("user_id", user_id).execute()
    sb.table("user_roles").insert({"user_id": user_id, "role": body.role}).execute()
    return {"message": "Role updated"}


@router.patch("/users/{user_id}/plan")
async def update_plan(user_id: str, body: PlanUpdate, _admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    sb.table("subscriptions").upsert({"user_id": user_id, "plan": body.plan, "status": "active"}, on_conflict="user_id").execute()
    return {"message": "Plan updated"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin: Annotated[dict, Depends(require_admin)]):
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    sb = get_supabase()
    sb.auth.admin.delete_user(user_id)
    logger.info("Admin %s deleted user %s", admin["id"], user_id)
    return {"message": "User deleted"}


@router.get("/uploads")
async def list_all_uploads(_admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    result = sb.table("uploads").select("*").order("created_at", desc=True).execute()
    return {"uploads": result.data or []}


@router.delete("/reports/{report_id}")
async def admin_delete_report(report_id: str, _admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    report = sb.table("reports").select("*").eq("id", report_id).maybe_single().execute()
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")
    upload_id = report.data["upload_id"]
    upload = sb.table("uploads").select("storage_path").eq("id", upload_id).maybe_single().execute()
    if upload.data:
        sb.storage.from_("fabric-images").remove([upload.data["storage_path"]])
        sb.table("uploads").delete().eq("id", upload_id).execute()
    sb.table("reports").delete().eq("id", report_id).execute()
    return {"message": "Report deleted"}


@router.get("/contacts")
async def list_contacts(_admin: Annotated[dict, Depends(require_admin)]):
    sb = get_supabase()
    result = sb.table("contact_messages").select("*").order("created_at", desc=True).execute()
    return {"contacts": result.data or []}
