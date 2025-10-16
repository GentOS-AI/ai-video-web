"""
Video schemas for API requests and responses
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.video import VideoStatus, AIModel


class VideoGenerateRequest(BaseModel):
    """Schema for video generation request"""
    prompt: str = Field(..., min_length=10, max_length=500, description="Video generation prompt")
    model: str = Field(default="sora-2", description="AI model to use")
    reference_image_url: Optional[str] = Field(None, description="Reference image URL")


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
