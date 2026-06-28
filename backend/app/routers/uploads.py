import logging
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.dependencies import get_current_user
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED = {"image/jpeg", "image/jpg", "image/png"}
MAX_BYTES = 10 * 1024 * 1024


@router.post("")
async def create_upload(
    user: Annotated[dict, Depends(get_current_user)],
    file: UploadFile = File(...),
):
    if file.content_type not in ALLOWED:
        raise HTTPException(status_code=400, detail="Only JPG and PNG images are supported")

    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File must be under 10MB")

    ext = "jpg" if file.content_type in {"image/jpeg", "image/jpg"} else "png"
    path = f"{user['id']}/{uuid.uuid4()}.{ext}"
    sb = get_supabase()

    storage = sb.storage.from_("fabric-images")
    storage.upload(path, content, {"content-type": file.content_type or "image/jpeg"})

    row = sb.table("uploads").insert({
        "user_id": user["id"],
        "storage_path": path,
        "original_filename": file.filename or f"upload.{ext}",
        "file_size": len(content),
        "mime_type": file.content_type or "image/jpeg",
    }).execute()

    logger.info("Upload created for user %s: %s", user["id"], path)
    return {"upload": row.data[0] if row.data else None}


@router.get("")
async def list_uploads(user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    result = sb.table("uploads").select("*").eq("user_id", user["id"]).order("created_at", desc=True).execute()
    return {"uploads": result.data or []}


@router.delete("/{upload_id}")
async def delete_upload(upload_id: str, user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    upload = sb.table("uploads").select("*").eq("id", upload_id).eq("user_id", user["id"]).maybe_single().execute()
    if not upload.data:
        raise HTTPException(status_code=404, detail="Upload not found")

    sb.storage.from_("fabric-images").remove([upload.data["storage_path"]])
    sb.table("uploads").delete().eq("id", upload_id).execute()
    logger.info("Upload deleted: %s", upload_id)
    return {"message": "Upload deleted"}
