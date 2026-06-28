import logging
import random
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reports", tags=["Reports"])

FABRICS = ["Plain Weave Cotton", "Twill Denim", "Satin Polyester", "Dobby Blend"]
WEAVES = ["plain", "twill", "satin", "dobby"]


def mock_analysis(seed: str) -> dict:
    h = sum(ord(c) for c in seed)
    warp = 80 + (h % 40)
    weft = 70 + ((h >> 3) % 35)
    return {
        "thread_density": warp + weft,
        "warp_count": warp,
        "weft_count": weft,
        "fabric_type": FABRICS[h % len(FABRICS)],
        "weave_pattern": WEAVES[h % len(WEAVES)],
        "confidence_score": round(0.85 + random.random() * 0.14, 3),
        "ai_suggestions": "Consider verifying edge tension. Sample shows consistent weave alignment.",
        "status": "completed",
    }


@router.post("")
async def create_report(
    user: Annotated[dict, Depends(get_current_user)],
    upload_id: str,
):
    sb = get_supabase()
    upload = sb.table("uploads").select("*").eq("id", upload_id).eq("user_id", user["id"]).maybe_single().execute()
    if not upload.data:
        raise HTTPException(status_code=404, detail="Upload not found")

    analysis = mock_analysis(upload_id)
    result = sb.table("reports").insert({
        "upload_id": upload_id,
        "user_id": user["id"],
        **analysis,
    }).execute()
    logger.info("Report created for upload %s", upload_id)
    return {"report": result.data[0] if result.data else None}


@router.get("")
async def list_reports(user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    result = sb.table("reports").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return {"reports": result.data or []}


@router.get("/{report_id}")
async def get_report(report_id: str, user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    result = sb.table("reports").select("*").eq("id", report_id).eq("user_id", user["id"]).maybe_single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"report": result.data}


@router.delete("/{report_id}")
async def delete_report(report_id: str, user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    report = sb.table("reports").select("*, uploads(storage_path)").eq("id", report_id).eq("user_id", user["id"]).maybe_single().execute()
    if not report.data:
        raise HTTPException(status_code=404, detail="Report not found")

    upload_id = report.data["upload_id"]
    upload_row = sb.table("uploads").select("storage_path").eq("id", upload_id).maybe_single().execute()
    if upload_row.data:
        sb.storage.from_("fabric-images").remove([upload_row.data["storage_path"]])
        sb.table("uploads").delete().eq("id", upload_id).execute()

    sb.table("reports").delete().eq("id", report_id).execute()
    return {"message": "Report deleted"}
