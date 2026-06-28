import logging

from fastapi import APIRouter, HTTPException

from app.schemas.common import ContactMessage
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("")
async def submit_contact(body: ContactMessage):
    sb = get_supabase()
    try:
        result = sb.table("contact_messages").insert(body.model_dump()).execute()
    except Exception as exc:
        logger.error("Contact submission failed: %s", exc)
        raise HTTPException(status_code=500, detail="Could not send message") from exc
    logger.info("Contact message from %s", body.email)
    return {"message": "Message sent", "id": result.data[0]["id"] if result.data else None}
