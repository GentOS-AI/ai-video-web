"""
Enhancement Task model - AI image enhancement and script generation tasks
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum, Float
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class EnhancementStatus(str, enum.Enum):
    """Enhancement task status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class EnhancementTask(Base):
    """
    Model for tracking image enhancement and script generation tasks
    """
    __tablename__ = "enhancement_tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Input parameters
    original_image_path = Column(String(500), nullable=True)  # Path to uploaded image
    user_description = Column(Text, nullable=True)  # User's product description
    duration = Column(Integer, default=4)  # Target video duration
    language = Column(String(10), default="en")  # Script language

    # Output results
    enhanced_image_url = Column(String(500), nullable=True)  # URL of enhanced image
    script = Column(Text, nullable=True)  # Generated advertising script
    product_analysis = Column(Text, nullable=True)  # JSON string of product analysis
    style = Column(String(200), nullable=True)  # Video style keywords
    camera = Column(String(200), nullable=True)  # Camera movements
    lighting = Column(String(200), nullable=True)  # Lighting setup

    # Task metadata
    status = Column(SQLEnum(EnhancementStatus), default=EnhancementStatus.PENDING, nullable=False, index=True)
    error_message = Column(Text, nullable=True)
    tokens_used = Column(Integer, default=0)  # GPT-4o tokens consumed
    processing_time = Column(Float, nullable=True)  # Total processing time in seconds

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="enhancement_tasks")

    def __repr__(self):
        return f"<EnhancementTask(id={self.id}, status={self.status}, user_id={self.user_id})>"
