"""
Generated Script model for storing AI-generated video scripts
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class GeneratedScript(Base):
    __tablename__ = "generated_scripts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_image_id = Column(Integer, ForeignKey("uploaded_images.id", ondelete="SET NULL"), nullable=True, index=True)

    # Script content
    script = Column(Text, nullable=False)  # Main script text
    structured_script = Column(Text, nullable=True)  # Structured format (if available)
    natural_script = Column(Text, nullable=True)  # Natural format (if available)

    # Metadata
    language = Column(String(10), nullable=True, default="en")  # en, zh, ja, etc.
    user_description = Column(Text, nullable=True)  # User's product description and ideas

    # AI service info
    ai_model = Column(String(50), nullable=True, default="gpt-4o")  # e.g., gpt-4o
    tokens_used = Column(Integer, nullable=True)  # Tokens consumed

    # Video generation parameters
    target_duration = Column(Integer, nullable=True)  # Target video duration in seconds
    target_model = Column(String(50), nullable=True)  # Target video model (sora-2, sora-2-pro)

    # Style metadata (extracted from script)
    style = Column(String(255), nullable=True)
    camera = Column(String(255), nullable=True)
    lighting = Column(String(255), nullable=True)

    # Credits cost
    credits_cost = Column(Float, nullable=False, default=10.0)  # Cost in credits

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="generated_scripts")
    uploaded_image = relationship("UploadedImage", back_populates="generated_scripts")
    videos = relationship("Video", back_populates="generated_script")

    def __repr__(self):
        return f"<GeneratedScript(id={self.id}, user_id={self.user_id}, language={self.language})>"
