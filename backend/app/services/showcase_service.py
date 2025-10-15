"""
Showcase service - Homepage content management
"""
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.showcase import ShowcaseVideo
from app.models.trial_image import TrialImage


def get_showcase_videos(
    db: Session,
    skip: int = 0,
    limit: int = 6,
    category: Optional[str] = None,
    featured_only: bool = False,
) -> tuple[List[ShowcaseVideo], int]:
    """
    Get showcase videos for homepage

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records
        category: Optional category filter
        featured_only: If True, only return featured videos

    Returns:
        Tuple of (videos list, total count)
    """
    query = db.query(ShowcaseVideo)

    if category:
        query = query.filter(ShowcaseVideo.category == category)

    if featured_only:
        query = query.filter(ShowcaseVideo.is_featured == True)

    total = query.count()
    videos = query.order_by(ShowcaseVideo.order).offset(skip).limit(limit).all()

    return videos, total


def get_hero_videos(db: Session, limit: int = 3) -> List[ShowcaseVideo]:
    """
    Get videos for hero carousel

    Args:
        db: Database session
        limit: Maximum number of videos

    Returns:
        List of featured showcase videos
    """
    videos = (
        db.query(ShowcaseVideo)
        .filter(ShowcaseVideo.is_featured == True)
        .order_by(ShowcaseVideo.order)
        .limit(limit)
        .all()
    )

    return videos


def get_trial_images(
    db: Session,
    skip: int = 0,
    limit: int = 8,
    active_only: bool = True,
) -> tuple[List[TrialImage], int]:
    """
    Get trial images for user selection

    Args:
        db: Database session
        skip: Number of records to skip
        limit: Maximum number of records
        active_only: If True, only return active images

    Returns:
        Tuple of (images list, total count)
    """
    query = db.query(TrialImage)

    if active_only:
        query = query.filter(TrialImage.is_active == True)

    total = query.count()
    images = query.order_by(TrialImage.order).offset(skip).limit(limit).all()

    return images, total
