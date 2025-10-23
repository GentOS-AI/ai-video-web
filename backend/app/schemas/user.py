"""
User schemas for API requests and responses
"""
from datetime import datetime
from typing import Optional, List
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
    is_new_user: bool = True
    subscription_plan: str = "free"
    subscription_status: str = "active"
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
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
    is_new_user: bool = True
    subscription_plan: str = "free"
    subscription_status: str = "active"
    subscription_start_date: Optional[datetime] = None
    subscription_end_date: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreditsResponse(BaseModel):
    """Schema for user credits response"""
    credits: float
    user_id: int


class RecentUserInfo(BaseModel):
    """Schema for recent user info (minimal data for display)"""
    id: int
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    email: str

    class Config:
        from_attributes = True


class RecentUsersResponse(BaseModel):
    """Schema for recent users response"""
    recent_users: List[RecentUserInfo]
    total_count: int
    display_count: int
