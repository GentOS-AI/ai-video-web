"""
Enhancement task schemas for API requests and responses
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.enhancement_task import EnhancementStatus


class EnhancementTaskCreateRequest(BaseModel):
    """Schema for creating enhancement task (async)"""
    user_description: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Product description for image enhancement and script generation"
    )
    language: str = Field(
        "en",
        description="Language for script generation",
        pattern="^[a-z]{2}(-[A-Z]{2})?$"
    )


class EnhancementTaskResponse(BaseModel):
    """Schema for enhancement task response"""
    id: int
    user_id: int
    original_image_path: str
    user_description: str
    enhanced_image_url: Optional[str] = None
    script: Optional[str] = None
    product_analysis: Optional[str] = None
    status: EnhancementStatus
    error_message: Optional[str] = None
    tokens_used: int
    processing_time: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EnhancementTaskStatusResponse(BaseModel):
    """Schema for enhancement task status (used in SSE)"""
    id: int
    status: EnhancementStatus
    enhanced_image_url: Optional[str] = None
    script: Optional[str] = None
    product_analysis: Optional[str] = None
    error_message: Optional[str] = None
    tokens_used: int
    processing_time: Optional[float] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class EnhancementProgressEvent(BaseModel):
    """Schema for SSE progress events"""
    task_id: int
    status: EnhancementStatus
    message: str
    progress: int = Field(..., ge=0, le=100, description="Progress percentage (0-100)")
    enhanced_image_url: Optional[str] = None
    script: Optional[str] = None
    product_analysis: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
