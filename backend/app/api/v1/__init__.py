"""
API v1 routes
"""
from fastapi import APIRouter
from app.api.v1 import auth, users, videos, showcase, upload, credits, ai, payments, webhooks

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(videos.router, prefix="/videos", tags=["Videos"])
api_router.include_router(showcase.router, prefix="/showcase", tags=["Showcase"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(credits.router, prefix="/credits", tags=["Credits"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI Services"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["Webhooks"])
