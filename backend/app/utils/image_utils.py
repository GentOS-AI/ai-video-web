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


def resize_image_for_sora(content: bytes) -> bytes:
    """
    Resize image to Sora-compatible dimensions (1280x720 or 720x1280)

    Smart resizing with aspect ratio detection:
    - Landscape images (width > height) → 1280x720
    - Portrait images (height > width) → 720x1280
    - Square images (width == height) → 1280x720 (default to landscape)

    Uses crop-and-resize to maintain aspect ratio:
    1. Crop to target aspect ratio (16:9 or 9:16)
    2. Resize to exact target dimensions

    Args:
        content: Original image bytes

    Returns:
        Resized image bytes (JPEG format)

    Raises:
        ValueError: If image processing fails
    """
    try:
        img = PILImage.open(BytesIO(content))

        # Convert RGBA to RGB if needed
        if img.mode == 'RGBA':
            background = PILImage.new('RGB', img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
            img = background
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Get original dimensions
        original_width, original_height = img.size

        # Determine target dimensions based on orientation
        if original_width > original_height:
            # Landscape image → 1280x720 (16:9)
            target_width, target_height = 1280, 720
            target_aspect_ratio = 16 / 9
        elif original_height > original_width:
            # Portrait image → 720x1280 (9:16)
            target_width, target_height = 720, 1280
            target_aspect_ratio = 9 / 16
        else:
            # Square image (width == height) → default to landscape 1280x720
            target_width, target_height = 1280, 720
            target_aspect_ratio = 16 / 9

        # Calculate current aspect ratio
        current_aspect_ratio = original_width / original_height

        # Crop to target aspect ratio (center crop)
        if abs(current_aspect_ratio - target_aspect_ratio) > 0.01:  # Not already at target ratio
            if current_aspect_ratio > target_aspect_ratio:
                # Image is wider than target ratio → crop width
                new_width = int(original_height * target_aspect_ratio)
                new_height = original_height
                left = (original_width - new_width) // 2
                top = 0
                right = left + new_width
                bottom = original_height
            else:
                # Image is taller than target ratio → crop height
                new_width = original_width
                new_height = int(original_width / target_aspect_ratio)
                left = 0
                top = (original_height - new_height) // 2
                right = original_width
                bottom = top + new_height

            # Crop image
            img = img.crop((left, top, right, bottom))

        # Resize to exact target dimensions
        img_resized = img.resize((target_width, target_height), PILImage.Resampling.LANCZOS)

        # Save to bytes
        output = BytesIO()
        img_resized.save(output, format='JPEG', quality=95)
        output.seek(0)

        return output.read()

    except Exception as e:
        raise ValueError(f"Failed to resize image: {str(e)}")
