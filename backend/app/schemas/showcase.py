"""
Showcase and trial image schemas
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ShowcaseVideoResponse(BaseModel):
    """Schema for showcase video response"""
    id: int
    title: str
    description: Optional[str] = None
    category: str
    video_url: str
    poster_url: str
    is_featured: bool
    order: int

    class Config:
        from_attributes = True


class ShowcaseVideoListResponse(BaseModel):
    """Schema for showcase video list response"""
    videos: List[ShowcaseVideoResponse]
    total: int


class TrialImageResponse(BaseModel):
    """Schema for trial image response"""
    id: int
    title: str
    image_url: str
    category: Optional[str] = None
    order: int

    class Config:
        from_attributes = True


class TrialImageListResponse(BaseModel):
    """Schema for trial image list response"""
    images: List[TrialImageResponse]
    total: int


class HeroVideoResponse(BaseModel):
    """Schema for hero carousel video response"""
    id: int
    title: str
    video_url: str
    poster_url: str

    class Config:
        from_attributes = True


class HeroVideoListResponse(BaseModel):
    """Schema for hero video list response"""
    videos: List[HeroVideoResponse]
