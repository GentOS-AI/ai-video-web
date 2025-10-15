"""
User schemas for API requests and responses
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """Schema for creating a user"""
    google_id: str


class UserUpdate(BaseModel):
    """Schema for updating a user"""
    name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserInDB(UserBase):
    """Schema for user in database"""
    id: int
    google_id: str
    credits: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Enable ORM mode for SQLAlchemy models


class UserResponse(BaseModel):
    """Schema for user response"""
    id: int
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    credits: float
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreditsResponse(BaseModel):
    """Schema for user credits response"""
    credits: float
    user_id: int
