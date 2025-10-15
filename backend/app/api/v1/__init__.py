"""
API v1 routes
"""
from fastapi import APIRouter
from app.api.v1 import auth, users, videos, showcase, upload

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(videos.router, prefix="/videos", tags=["Videos"])
api_router.include_router(showcase.router, prefix="/showcase", tags=["Showcase"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
