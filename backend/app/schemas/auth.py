"""
Authentication schemas
"""
from typing import Optional
from pydantic import BaseModel, EmailStr


class GoogleAuthRequest(BaseModel):
    """Schema for Google OAuth authentication request"""
    code: str
    redirect_uri: str


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str


class TokenPayload(BaseModel):
    """Schema for JWT token payload"""
    sub: int  # User ID
    email: EmailStr
    exp: int  # Expiration timestamp


class GoogleUserInfo(BaseModel):
    """Schema for Google user information"""
    id: str
    email: EmailStr
    name: Optional[str] = None
    picture: Optional[str] = None
