import logging

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import AuthResponse, ForgotPasswordRequest, LoginRequest, SignUpRequest
from app.services.supabase import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse)
async def signup(body: SignUpRequest):
    sb = get_supabase()
    try:
        result = sb.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {"data": {"full_name": body.full_name}},
        })
    except Exception as exc:
        logger.error("Signup failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    session = result.session
    user = result.user
    if session and user:
        return AuthResponse(
            access_token=session.access_token,
            refresh_token=session.refresh_token,
            user_id=user.id,
            email=user.email,
        )
    return AuthResponse(message="Check your email to verify your account before signing in.")


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest):
    sb = get_supabase()
    try:
        result = sb.auth.sign_in_with_password({"email": body.email, "password": body.password})
    except Exception as exc:
        logger.error("Login failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials") from exc

    session = result.session
    user = result.user
    if not session or not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return AuthResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        user_id=user.id,
        email=user.email,
    )


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    sb = get_supabase()
    try:
        sb.auth.reset_password_for_email(body.email)
    except Exception as exc:
        logger.error("Password reset failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return {"message": "Password reset email sent if the account exists."}


@router.post("/logout")
async def logout():
    return {"message": "Signed out. Discard client-side tokens."}
