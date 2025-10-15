"""
Trial image model - Sample images for users to try
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from app.database import Base


class TrialImage(Base):
    __tablename__ = "trial_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=False)
    category = Column(String(100), nullable=True, index=True)  # Tech, Business, AI, etc.
    order = Column(Integer, default=0, index=True)  # Display order
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<TrialImage(id={self.id}, title={self.title})>"
