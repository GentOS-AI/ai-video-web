"""
Authentication API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.schemas.auth import GoogleAuthRequest, TokenResponse, TokenRefreshRequest
from app.schemas.user import UserResponse
from app.services import auth_service
from app.core.security import decode_token
from app.models.user import User

router = APIRouter()


@router.post("/google", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def google_auth(
    auth_request: GoogleAuthRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate with Google OAuth

    Exchange authorization code for tokens and create/update user
    """
    try:
        # Exchange code for tokens
        token_data = await auth_service.exchange_code_for_token(
            auth_request.code,
            auth_request.redirect_uri,
        )

        # Get user info from Google
        google_user = await auth_service.get_google_user_info(token_data["access_token"])

        # Get or create user in database
        user = auth_service.get_or_create_user(db, google_user)

        # Create JWT tokens
        tokens = auth_service.create_user_tokens(user)

        return tokens

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    refresh_request: TokenRefreshRequest,
    db: Session = Depends(get_db),
):
    """
    Refresh access token using refresh token
    """
    payload = decode_token(refresh_request.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    tokens = auth_service.create_user_tokens(user)
    return tokens


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user information
    """
    return current_user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)):
    """
    Logout (client-side should delete tokens)
    """
    # In a stateless JWT system, logout is handled client-side
    # Server can maintain a token blacklist if needed
    return None
