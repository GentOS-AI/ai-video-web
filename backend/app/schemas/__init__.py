"""
Pydantic schemas for request/response validation
"""
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDB,
    UserResponse,
    UserCreditsResponse,
)
from app.schemas.auth import (
    GoogleAuthRequest,
    TokenResponse,
    TokenRefreshRequest,
    TokenPayload,
    GoogleUserInfo,
)
from app.schemas.video import (
    VideoGenerateRequest,
    VideoResponse,
    VideoListResponse,
    VideoStatusResponse,
    ModelInfo,
    ModelListResponse,
)
from app.schemas.showcase import (
    ShowcaseVideoResponse,
    ShowcaseVideoListResponse,
    TrialImageResponse,
    TrialImageListResponse,
    HeroVideoResponse,
    HeroVideoListResponse,
)

__all__ = [
    # User schemas
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserResponse",
    "UserCreditsResponse",
    # Auth schemas
    "GoogleAuthRequest",
    "TokenResponse",
    "TokenRefreshRequest",
    "TokenPayload",
    "GoogleUserInfo",
    # Video schemas
    "VideoGenerateRequest",
    "VideoResponse",
    "VideoListResponse",
    "VideoStatusResponse",
    "ModelInfo",
    "ModelListResponse",
    # Showcase schemas
    "ShowcaseVideoResponse",
    "ShowcaseVideoListResponse",
    "TrialImageResponse",
    "TrialImageListResponse",
    "HeroVideoResponse",
    "HeroVideoListResponse",
]
