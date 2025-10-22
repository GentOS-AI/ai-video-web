"""
Video model - User generated videos
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class VideoStatus(str, enum.Enum):
    """Video generation status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AIModel(str, enum.Enum):
    """Available AI models"""
    SORA_2 = "sora-2"
    SORA_2_PRO = "sora-2-pro"


class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    model = Column(SQLEnum(AIModel, values_callable=lambda obj: [e.value for e in obj]), default=AIModel.SORA_2, nullable=False)
    reference_image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    poster_url = Column(String(500), nullable=True)
    status = Column(SQLEnum(VideoStatus), default=VideoStatus.PENDING, nullable=False, index=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    resolution = Column(String(50), nullable=True)  # e.g., "1920x1080"
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="videos")

    def __repr__(self):
        return f"<Video(id={self.id}, status={self.status}, user_id={self.user_id})>"
