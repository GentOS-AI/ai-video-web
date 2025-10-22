"""
Video schemas for API requests and responses
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from app.models.video import VideoStatus, AIModel


class VideoGenerateRequest(BaseModel):
    """Schema for video generation request"""
    prompt: str = Field(..., min_length=10, max_length=5000, description="Video generation prompt")
    model: str = Field(default="sora-2", description="AI model to use")
    reference_image_url: Optional[str] = Field(None, description="Reference image URL")
    duration: int = Field(8, ge=4, le=12, description="Video duration in seconds (default 8s)")

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: int) -> int:
        if value not in (4, 8, 12):
            raise ValueError("Duration must be one of 4, 8, or 12 seconds")
        return value

class VideoGenerateFlexibleRequest(BaseModel):
    """
    Flexible video generation request - Supports two modes

    Mode 1: Enhanced image + Optimized script (from enhance-and-script API)
        - Required: image_url, prompt
        - GPT-4o: Not called (already processed in enhance-and-script)

    Mode 2: Original image + Auto-generate script
        - Required: image_file (via Form upload), user_description
        - GPT-4o: Called to generate Sora prompt
    """

    # ========== Mode 1: Enhanced image + Optimized script ==========
    image_url: Optional[str] = Field(
        None,
        description="Enhanced image URL (Required for Mode 1, from enhance-and-script API)"
    )
    prompt: Optional[str] = Field(
        None,
        description="Optimized video script (Required for Mode 1, from enhance-and-script 'script' field)",
        min_length=50,
        max_length=5000
    )

    # ========== Mode 2: Original image + Auto-generate ==========
    # image_file: UploadFile (Uploaded via Form parameter, not defined here)
    user_description: Optional[str] = Field(
        None,
        description="Product description for prompt generation (Required for Mode 2)",
        max_length=2000
    )

    # ========== Common parameters ==========
    duration: int = Field(8, ge=4, le=12, description="Video duration in seconds")
    model: str = Field("sora-2", description="AI model (hard-coded to sora-2)")
    language: str = Field("en", description="Language (only used in Mode 2)", pattern="^[a-z]{2}(-[A-Z]{2})?$")

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: int) -> int:
        if value not in (4, 8, 12):
            raise ValueError("Duration must be one of 4, 8, or 12 seconds")
        return value


class VideoResponse(BaseModel):
    """Schema for video response"""
    id: int
    user_id: int
    prompt: str
    model: AIModel
    reference_image_url: Optional[str] = None
    video_url: Optional[str] = None
    poster_url: Optional[str] = None
    status: VideoStatus
    duration: Optional[int] = None
    resolution: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VideoListResponse(BaseModel):
    """Schema for video list response"""
    videos: List[VideoResponse]
    total: int
    page: int
    page_size: int


class VideoStatusResponse(BaseModel):
    """Schema for video status response"""
    id: int
    status: VideoStatus
    video_url: Optional[str] = None
    poster_url: Optional[str] = None
    error_message: Optional[str] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class ModelInfo(BaseModel):
    """Schema for AI model information"""
    id: str
    name: str
    version: str
    description: Optional[str] = None


class ModelListResponse(BaseModel):
    """Schema for model list response"""
    models: List[ModelInfo]
