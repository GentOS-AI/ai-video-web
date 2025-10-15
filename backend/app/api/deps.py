"""
API dependencies for authentication and database
"""
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import decode_token
from app.core.exceptions import AuthenticationException
from app.models.user import User

# HTTP Bearer token security
security = HTTPBearer()


def get_current_user(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> User:
    """
    Get current authenticated user from JWT token

    Args:
        db: Database session
        credentials: HTTP authorization credentials

    Returns:
        Current user instance

    Raises:
        HTTPException: If authentication fails
    """
    token = credentials.credentials
    payload = decode_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Convert user_id from string to int
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_user_optional(
    db: Session = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise

    Args:
        db: Database session
        credentials: Optional HTTP authorization credentials

    Returns:
        User instance or None
    """
    if not credentials:
        return None

    try:
        return get_current_user(db, credentials)
    except HTTPException:
        return None
