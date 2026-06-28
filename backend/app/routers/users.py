import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import get_current_user
from app.schemas.common import ProfileUpdate
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me")
async def get_me(user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    profile = sb.table("profiles").select("*").eq("id", user["id"]).maybe_single().execute()
    subscription = sb.table("subscriptions").select("*").eq("user_id", user["id"]).maybe_single().execute()
    return {"user": user, "profile": profile.data, "subscription": subscription.data}


@router.patch("/me")
async def update_me(body: ProfileUpdate, user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    payload = body.model_dump(exclude_none=True)
    if not payload:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = sb.table("profiles").update(payload).eq("id", user["id"]).execute()
    logger.info("Profile updated for user %s", user["id"])
    return {"profile": result.data[0] if result.data else None}


@router.delete("/me")
async def delete_me(user: Annotated[dict, Depends(get_current_user)]):
    sb = get_supabase()
    sb.auth.admin.delete_user(user["id"])
    logger.info("User deleted: %s", user["id"])
    return {"message": "Account deleted"}
