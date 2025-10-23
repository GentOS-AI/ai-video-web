"""
User model
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    credits = Column(Float, default=100.0)  # Initial credits for new users

    # New user flag - True for users who haven't generated their first video
    is_new_user = Column(Boolean, default=True)

    # Subscription fields
    subscription_plan = Column(String(50), default="free")  # free, basic, premium
    subscription_status = Column(String(20), default="active")  # active, cancelled, expired
    subscription_start_date = Column(DateTime, nullable=True)
    subscription_end_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")
    uploaded_images = relationship("UploadedImage", back_populates="user", cascade="all, delete-orphan")
    enhancement_tasks = relationship("EnhancementTask", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, name={self.name}, subscription={self.subscription_plan})>"
