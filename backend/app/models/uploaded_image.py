"""
Uploaded Image model for storing user-uploaded images
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class UploadedImage(Base):
    __tablename__ = "uploaded_images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)  # HTTPS URL of uploaded image
    file_size = Column(Integer, nullable=True)  # File size in bytes
    file_type = Column(String(50), nullable=True)  # MIME type (image/jpeg, image/png)
    width = Column(Integer, nullable=True)  # Image width in pixels
    height = Column(Integer, nullable=True)  # Image height in pixels

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="uploaded_images")

    def __repr__(self):
        return f"<UploadedImage(id={self.id}, user_id={self.user_id}, filename={self.filename})>"
