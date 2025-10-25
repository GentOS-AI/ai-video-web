"""
Google Cloud Storage Service
Handles file upload, deletion, and URL generation for GCS
"""
import os
import uuid
import json
import logging
from typing import Optional, Tuple
from io import BytesIO

from google.cloud import storage
from google.oauth2 import service_account
from fastapi import UploadFile, HTTPException, status

from app.core.config import settings

logger = logging.getLogger(__name__)


class GCSService:
    """Google Cloud Storage service for file operations"""

    def __init__(self):
        """Initialize GCS client with credentials"""
        self.client: Optional[storage.Client] = None
        self.bucket: Optional[storage.Bucket] = None
        self._initialize_client()

    def _initialize_client(self):
        """
        Initialize GCS client with authentication

        Supports two authentication methods (in priority order):
        1. JSON credentials string from environment variable (GOOGLE_CLOUD_CREDENTIALS_JSON)
        2. JSON file path from environment variable (GOOGLE_APPLICATION_CREDENTIALS)

        Note: GCS is now the only storage method (USE_GCS_STORAGE switch removed)
        """
        try:
            credentials = None

            # Method 1: Use JSON credentials string (优先,适合生产环境)
            if settings.GOOGLE_CLOUD_CREDENTIALS_JSON:
                logger.info("  🔑 Authenticating with JSON credentials string")
                credentials_info = json.loads(settings.GOOGLE_CLOUD_CREDENTIALS_JSON)
                credentials = service_account.Credentials.from_service_account_info(
                    credentials_info
                )

            # Method 2: Use JSON file path (适合本地开发)
            elif settings.GOOGLE_APPLICATION_CREDENTIALS:
                logger.info(f"  🔑 Authenticating with JSON file: {settings.GOOGLE_APPLICATION_CREDENTIALS}")
                credentials = service_account.Credentials.from_service_account_file(
                    settings.GOOGLE_APPLICATION_CREDENTIALS
                )

            # Create client
            if credentials:
                self.client = storage.Client(
                    project=settings.GOOGLE_CLOUD_PROJECT,
                    credentials=credentials
                )
            else:
                # Fallback to Application Default Credentials (适合 GCP 环境内部署)
                logger.info("  🔑 Using Application Default Credentials")
                self.client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)

            # Get bucket
            self.bucket = self.client.bucket(settings.GOOGLE_CLOUD_BUCKET)
            logger.info(f"  ✅ GCS client initialized successfully (bucket: {settings.GOOGLE_CLOUD_BUCKET})")

        except Exception as e:
            logger.error(f"  ❌ Failed to initialize GCS client: {e}")
            raise RuntimeError(f"GCS initialization failed: {e}")

    def _generate_blob_name(self, user_id: int, filename: str, file_type: str = "image") -> str:
        """
        Generate unique blob name for GCS

        Format: {prefix}/users/{user_id}/{file_type}s/{uuid}.{ext}
        Example: video4ads/users/123/images/uuid-123.jpg

        Args:
            user_id: User ID
            filename: Original filename
            file_type: File type (image, video, etc.)

        Returns:
            Blob name (path in GCS)
        """
        file_extension = os.path.splitext(filename)[1] or ".jpg"
        unique_filename = f"{uuid.uuid4()}{file_extension}"

        blob_name = f"{settings.GCS_FOLDER_PREFIX}/users/{user_id}/{file_type}s/{unique_filename}"
        return blob_name

    def _get_public_url(self, blob_name: str) -> str:
        """
        Get public URL for a blob

        Args:
            blob_name: Blob name (path in GCS)

        Returns:
            Public URL
        """
        return f"{settings.GCS_PUBLIC_URL_BASE}/{settings.GOOGLE_CLOUD_BUCKET}/{blob_name}"

    def upload_file(
        self,
        file: UploadFile,
        user_id: int,
        file_type: str = "image",
        content_type: Optional[str] = None
    ) -> Tuple[str, str, int]:
        """
        Upload file to GCS

        Args:
            file: Uploaded file
            user_id: User ID
            file_type: File type (image, video, etc.)
            content_type: Optional content type override

        Returns:
            Tuple of (blob_name, public_url, file_size)

        Raises:
            HTTPException: If upload fails
        """
        if not self.client or not self.bucket:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GCS client not initialized. Please check GCS configuration."
            )

        try:
            # Read file content
            file_content = file.file.read()
            file_size = len(file_content)

            # Generate blob name
            blob_name = self._generate_blob_name(user_id, file.filename or "untitled", file_type)

            # Create blob
            blob = self.bucket.blob(blob_name)

            # Set content type
            if content_type:
                blob.content_type = content_type
            elif file.content_type:
                blob.content_type = file.content_type

            # Upload file
            blob.upload_from_file(
                BytesIO(file_content),
                content_type=blob.content_type,
                timeout=60  # 60 seconds timeout
            )

            # Note: bucket has Uniform Bucket-Level Access enabled
            # Public access is controlled at bucket level via IAM policy
            # No need to call blob.make_public() - it will fail with:
            # "Cannot get legacy ACL for an object when uniform bucket-level access is enabled"
            #
            # Bucket IAM policy should have:
            #   allUsers: roles/storage.objectViewer (for public read access)

            # Get public URL
            public_url = self._get_public_url(blob_name)

            logger.info(f"  ✅ File uploaded to GCS: {blob_name}")
            return blob_name, public_url, file_size

        except Exception as e:
            logger.error(f"  ❌ Failed to upload file to GCS: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file to GCS: {str(e)}"
            )

    def delete_file(self, blob_name: str) -> bool:
        """
        Delete file from GCS

        Args:
            blob_name: Blob name (path in GCS)

        Returns:
            True if deleted successfully, False otherwise
        """
        if not self.client or not self.bucket:
            logger.warning("  ⚠️  GCS client not initialized, skipping delete")
            return False

        try:
            blob = self.bucket.blob(blob_name)

            # Check if blob exists
            if not blob.exists():
                logger.warning(f"  ⚠️  Blob not found in GCS: {blob_name}")
                return False

            # Delete blob
            blob.delete()
            logger.info(f"  🗑️  File deleted from GCS: {blob_name}")
            return True

        except Exception as e:
            logger.error(f"  ❌ Failed to delete file from GCS: {e}")
            return False

    def extract_blob_name_from_url(self, file_url: str) -> Optional[str]:
        """
        Extract blob name from GCS public URL

        Args:
            file_url: Public URL (e.g., https://storage.googleapis.com/bucket/path/to/file.jpg)

        Returns:
            Blob name (path in GCS) or None if URL is not a GCS URL
        """
        try:
            # Remove base URL and bucket name
            url_base = f"{settings.GCS_PUBLIC_URL_BASE}/{settings.GOOGLE_CLOUD_BUCKET}/"
            if file_url.startswith(url_base):
                blob_name = file_url.replace(url_base, "")
                return blob_name

            # Try alternative format (public URL)
            alt_base = f"https://{settings.GOOGLE_CLOUD_BUCKET}.storage.googleapis.com/"
            if file_url.startswith(alt_base):
                blob_name = file_url.replace(alt_base, "")
                return blob_name

            return None

        except Exception as e:
            logger.error(f"  ❌ Failed to extract blob name from URL: {e}")
            return None

    def generate_signed_url(self, blob_name: str, expiration_minutes: int = 60) -> str:
        """
        Generate signed URL for private file access (可选功能)

        Args:
            blob_name: Blob name (path in GCS)
            expiration_minutes: URL expiration time in minutes

        Returns:
            Signed URL
        """
        if not self.client or not self.bucket:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GCS client not initialized"
            )

        try:
            from datetime import timedelta

            blob = self.bucket.blob(blob_name)
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(minutes=expiration_minutes),
                method="GET"
            )
            return signed_url

        except Exception as e:
            logger.error(f"  ❌ Failed to generate signed URL: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to generate signed URL: {str(e)}"
            )


# Global GCS service instance
gcs_service = GCSService()
