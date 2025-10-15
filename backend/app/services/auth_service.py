"""
Authentication service - Google OAuth and JWT handling
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
import httpx

from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.core.exceptions import AuthenticationException
from app.models.user import User
from app.schemas.auth import GoogleUserInfo, TokenResponse


async def exchange_code_for_token(code: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Exchange authorization code for Google access token

    Args:
        code: Authorization code from Google
        redirect_uri: Redirect URI used in OAuth flow

    Returns:
        Token information from Google

    Raises:
        AuthenticationException: If token exchange fails
    """
    token_endpoint = "https://oauth2.googleapis.com/token"

    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_endpoint, data=data)

        if response.status_code != 200:
            raise AuthenticationException("Failed to exchange code for token")

        return response.json()


async def get_google_user_info(access_token: str) -> GoogleUserInfo:
    """
    Get user information from Google using access token

    Args:
        access_token: Google access token

    Returns:
        Google user information

    Raises:
        AuthenticationException: If failed to get user info
    """
    user_info_endpoint = "https://www.googleapis.com/oauth2/v2/userinfo"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            user_info_endpoint,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if response.status_code != 200:
            raise AuthenticationException("Failed to get user information")

        data = response.json()
        return GoogleUserInfo(
            id=data["id"],
            email=data["email"],
            name=data.get("name"),
            picture=data.get("picture"),
        )


def get_or_create_user(db: Session, google_user: GoogleUserInfo) -> User:
    """
    Get existing user or create new one from Google user info

    Args:
        db: Database session
        google_user: Google user information

    Returns:
        User instance
    """
    # Try to find existing user by Google ID
    user = db.query(User).filter(User.google_id == google_user.id).first()

    if user:
        # Update user info if changed
        if user.email != google_user.email or user.name != google_user.name or user.avatar_url != google_user.picture:
            user.email = google_user.email
            user.name = google_user.name
            user.avatar_url = google_user.picture
            db.commit()
            db.refresh(user)
    else:
        # Create new user
        user = User(
            google_id=google_user.id,
            email=google_user.email,
            name=google_user.name,
            avatar_url=google_user.picture,
            credits=settings.DEFAULT_USER_CREDITS,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def create_user_tokens(user: User) -> TokenResponse:
    """
    Create access and refresh tokens for user

    Args:
        user: User instance

    Returns:
        Token response with access and refresh tokens
    """
    token_data = {"sub": str(user.id), "email": user.email}

    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
