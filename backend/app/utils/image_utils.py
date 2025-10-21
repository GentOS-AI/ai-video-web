"""
Image utility functions for video service
"""
import os
import requests
from typing import Optional
from urllib.parse import urlparse
from io import BytesIO
from PIL import Image as PILImage


def read_image_from_url(image_url: str, base_dir: str = "./uploads") -> bytes:
    """
    Read image from URL (supports both local paths and HTTP URLs)

    Args:
        image_url: Image URL (can be relative path like /uploads/... or full HTTP URL)
        base_dir: Base directory for local files

    Returns:
        Image bytes

    Raises:
        FileNotFoundError: If local file not found
        requests.HTTPError: If HTTP request fails
    """
    # Check if it's a local path
    if image_url.startswith('/uploads/') or image_url.startswith('./uploads/'):
        # Local file path
        if image_url.startswith('/'):
            image_url = image_url[1:]  # Remove leading slash

        file_path = os.path.join(base_dir, image_url.replace('/uploads/', ''))

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image file not found: {file_path}")

        with open(file_path, 'rb') as f:
            return f.read()

    else:
        # HTTP(S) URL
        response = requests.get(image_url, timeout=30)
        response.raise_for_status()
        return response.content


def get_file_extension(filename: str) -> str:
    """
    Get file extension from filename

    Args:
        filename: Original filename

    Returns:
        Extension without dot (e.g., 'jpg', 'png')
    """
    if not filename:
        return 'jpg'

    _, ext = os.path.splitext(filename)
    ext = ext.lower().lstrip('.')

    # Map common extensions
    if ext in ['jpeg', 'jpg']:
        return 'jpg'
    elif ext == 'png':
        return 'png'
    else:
        return 'jpg'  # Default


def validate_image_content(content: bytes, allowed_types: Optional[list] = None) -> dict:
    """
    Validate image content and get metadata

    Args:
        content: Image bytes
        allowed_types: List of allowed MIME types

    Returns:
        Dict with image metadata (width, height, format, size_mb)

    Raises:
        ValueError: If image is invalid or not allowed
    """
    if allowed_types is None:
        allowed_types = ['image/jpeg', 'image/png']

    try:
        img = PILImage.open(BytesIO(content))

        # Get format
        img_format = img.format
        if not img_format:
            raise ValueError("Cannot determine image format")

        # Check if format is allowed
        format_mime_map = {
            'JPEG': 'image/jpeg',
            'PNG': 'image/png',
            'WEBP': 'image/webp'
        }

        mime_type = format_mime_map.get(img_format.upper())
        if mime_type and mime_type not in allowed_types:
            raise ValueError(f"Image format {img_format} not allowed. Allowed: {allowed_types}")

        # Get dimensions
        width, height = img.size

        # Get size
        size_mb = len(content) / (1024 * 1024)

        return {
            'width': width,
            'height': height,
            'format': img_format,
            'mime_type': mime_type or f'image/{img_format.lower()}',
            'size_mb': round(size_mb, 2)
        }

    except PILImage.UnidentifiedImageError:
        raise ValueError("Invalid image file. Cannot identify format.")
    except Exception as e:
        raise ValueError(f"Error validating image: {str(e)}")
