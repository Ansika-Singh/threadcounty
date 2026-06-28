import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.logging_config import setup_logging
from app.routers import admin, auth, contact, dashboard, reports, uploads, users

setup_logging()
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ThreadCounty API",
    description="Production backend for ThreadCounty textile analysis platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prefix = settings.api_prefix
app.include_router(auth.router, prefix=prefix)
app.include_router(users.router, prefix=prefix)
app.include_router(uploads.router, prefix=prefix)
app.include_router(reports.router, prefix=prefix)
app.include_router(dashboard.router, prefix=prefix)
app.include_router(admin.router, prefix=prefix)
app.include_router(contact.router, prefix=prefix)


@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.get("/health")
async def health():
    return {"status": "ok", "service": "threadcounty-api"}
