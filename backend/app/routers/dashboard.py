import logging
from typing import Annotated

from fastapi import APIRouter, Depends

from app.dependencies import get_current_user
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def dashboard_stats(user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    uploads = sb.table("uploads").select("id, file_size, created_at").eq("user_id", user["id"]).execute()
    reports = (
        sb.table("reports")
        .select("id, fabric_type, confidence_score, created_at, upload_id")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    )
    profile = sb.table("profiles").select("*").eq("id", user["id"]).maybe_single().execute()
    subscription = sb.table("subscriptions").select("plan, status").eq("user_id", user["id"]).maybe_single().execute()
    notifications = (
        sb.table("notifications")
        .select("*")
        .eq("user_id", user["id"])
        .order("created_at", desc=True)
        .limit(10)
        .execute()
    )

    upload_rows = uploads.data or []
    total_bytes = sum(int(u.get("file_size") or 0) for u in upload_rows)

    activity = []
    for r in reports.data or []:
        activity.append({"type": "report", "label": r.get("fabric_type") or "Analysis", "at": r.get("created_at"), "id": r.get("id")})
    for u in upload_rows[:10]:
        activity.append({"type": "upload", "label": "Image uploaded", "at": u.get("created_at"), "id": u.get("id")})
    activity.sort(key=lambda x: x["at"] or "", reverse=True)

    return {
        "uploads_count": len(upload_rows),
        "reports_count": len(reports.data or []),
        "total_bytes": total_bytes,
        "recent_reports": reports.data or [],
        "profile": profile.data,
        "subscription": subscription.data,
        "notifications": notifications.data or [],
        "activity": activity[:15],
    }
