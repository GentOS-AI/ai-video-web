"""
Showcase video model - Featured videos displayed on homepage
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from app.database import Base


class ShowcaseVideo(Base):
    __tablename__ = "showcase_videos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # Product, Fashion, F&B, etc.
    video_url = Column(String(500), nullable=False)
    poster_url = Column(String(500), nullable=False)
    is_featured = Column(Boolean, default=False, index=True)
    order = Column(Integer, default=0, index=True)  # Display order
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ShowcaseVideo(id={self.id}, title={self.title}, category={self.category})>"
