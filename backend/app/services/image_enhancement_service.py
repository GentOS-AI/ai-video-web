"""
Image Enhancement Service for AI Video Generation
Provides image quality improvements and optimizations
"""
import logging
from io import BytesIO
from typing import Tuple, Dict, Any
from PIL import Image as PILImage
from PIL import ImageEnhance, ImageFilter, ImageOps
import numpy as np

logger = logging.getLogger(__name__)


class ImageEnhancementService:
    """
    Service for enhancing product images before video generation

    Features:
    - Automatic brightness and contrast adjustment
    - Color enhancement and saturation optimization
    - Sharpness improvement
    - Optional background removal (future feature)
    - Smart compression while maintaining quality
    """

    def __init__(self):
        logger.info("✅ Image Enhancement Service initialized")

    def enhance_image(
        self,
        image_data: bytes,
        mode: str = "standard"
    ) -> Tuple[bytes, Dict[str, Any]]:
        """
        Enhance product image quality based on selected mode

        Args:
            image_data: Original image bytes
            mode: Enhancement mode ('standard', 'professional', 'creative')

        Returns:
            Tuple of (enhanced_image_bytes, enhancement_details)
        """
        logger.info(f"🎨 Starting image enhancement with mode: {mode}")

        try:
            # Load image
            image = PILImage.open(BytesIO(image_data))
            original_size = len(image_data)
            original_dimensions = image.size

            logger.info(f"  Original image: {original_dimensions[0]}x{original_dimensions[1]}, {original_size / 1024:.1f}KB")

            # Convert to RGB if necessary
            if image.mode in ('RGBA', 'LA', 'P'):
                logger.info(f"  Converting {image.mode} to RGB...")
                background = PILImage.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                if image.mode in ('RGBA', 'LA'):
                    background.paste(image, mask=image.split()[-1] if len(image.split()) > 3 else None)
                else:
                    background.paste(image)
                image = background

            # Track applied enhancements
            enhancements = {
                'mode': mode,
                'original_size_kb': round(original_size / 1024, 1),
                'original_dimensions': f"{original_dimensions[0]}x{original_dimensions[1]}",
                'adjustments': []
            }

            # Apply enhancements based on mode
            if mode == "professional":
                image, mode_enhancements = self._apply_professional_enhancements(image)
                enhancements['adjustments'].extend(mode_enhancements)
            elif mode == "creative":
                image, mode_enhancements = self._apply_creative_enhancements(image)
                enhancements['adjustments'].extend(mode_enhancements)
            else:  # standard
                image, mode_enhancements = self._apply_standard_enhancements(image)
                enhancements['adjustments'].extend(mode_enhancements)

            # Auto-adjust levels if image is too dark or bright
            image, auto_adjustments = self._auto_adjust_levels(image)
            if auto_adjustments:
                enhancements['adjustments'].extend(auto_adjustments)

            # Optimize size while maintaining quality
            image, optimization_info = self._optimize_image_size(image)
            enhancements.update(optimization_info)

            # Convert to bytes
            output_buffer = BytesIO()
            image.save(output_buffer, format='JPEG', quality=95, optimize=True)
            enhanced_data = output_buffer.getvalue()

            # Update enhancement details
            enhancements['enhanced_size_kb'] = round(len(enhanced_data) / 1024, 1)
            enhancements['enhanced_dimensions'] = f"{image.size[0]}x{image.size[1]}"
            enhancements['size_reduction'] = f"{round((1 - len(enhanced_data) / original_size) * 100, 1)}%"

            logger.info(f"  ✅ Enhancement complete: {enhancements['enhanced_size_kb']}KB")
            logger.info(f"    Applied adjustments: {', '.join(enhancements['adjustments'])}")

            return enhanced_data, enhancements

        except Exception as e:
            logger.error(f"❌ Image enhancement failed: {str(e)}")
            logger.error("Stack trace:", exc_info=True)

            # Return original image if enhancement fails
            return image_data, {
                'mode': mode,
                'error': str(e),
                'adjustments': ['none - using original']
            }

    def _apply_standard_enhancements(self, image: PILImage.Image) -> Tuple[PILImage.Image, list]:
        """Apply standard enhancement settings"""
        adjustments = []

        # Mild brightness adjustment (105%)
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.05)
        adjustments.append("brightness +5%")

        # Mild contrast adjustment (110%)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.10)
        adjustments.append("contrast +10%")

        # Mild color enhancement (110%)
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.10)
        adjustments.append("color +10%")

        # Mild sharpness (105%)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.05)
        adjustments.append("sharpness +5%")

        logger.info(f"  Applied standard enhancements: {', '.join(adjustments)}")
        return image, adjustments

    def _apply_professional_enhancements(self, image: PILImage.Image) -> Tuple[PILImage.Image, list]:
        """Apply professional enhancement settings with stronger adjustments"""
        adjustments = []

        # Professional brightness (108%)
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.08)
        adjustments.append("brightness +8%")

        # Professional contrast (115%)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.15)
        adjustments.append("contrast +15%")

        # Professional color saturation (115%)
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.15)
        adjustments.append("color +15%")

        # Professional sharpness (110%)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.10)
        adjustments.append("sharpness +10%")

        # Apply subtle edge enhancement
        image = image.filter(ImageFilter.UnsharpMask(radius=1, percent=50, threshold=3))
        adjustments.append("unsharp mask")

        logger.info(f"  Applied professional enhancements: {', '.join(adjustments)}")
        return image, adjustments

    def _apply_creative_enhancements(self, image: PILImage.Image) -> Tuple[PILImage.Image, list]:
        """Apply creative enhancement settings for artistic effect"""
        adjustments = []

        # Creative brightness (110%)
        enhancer = ImageEnhance.Brightness(image)
        image = enhancer.enhance(1.10)
        adjustments.append("brightness +10%")

        # High contrast for dramatic effect (120%)
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.20)
        adjustments.append("contrast +20%")

        # Vibrant colors (125%)
        enhancer = ImageEnhance.Color(image)
        image = enhancer.enhance(1.25)
        adjustments.append("color +25%")

        # Strong sharpness (115%)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.15)
        adjustments.append("sharpness +15%")

        # Apply edge enhancement for pop effect
        image = image.filter(ImageFilter.EDGE_ENHANCE_MORE)
        adjustments.append("edge enhance")

        logger.info(f"  Applied creative enhancements: {', '.join(adjustments)}")
        return image, adjustments

    def _auto_adjust_levels(self, image: PILImage.Image) -> Tuple[PILImage.Image, list]:
        """
        Automatically adjust image levels based on histogram analysis
        """
        adjustments = []

        try:
            # Convert to numpy array for analysis
            img_array = np.array(image)

            # Calculate mean brightness
            mean_brightness = np.mean(img_array)

            # Adjust if too dark (< 100) or too bright (> 200)
            if mean_brightness < 100:
                # Image is too dark, brighten it
                enhancer = ImageEnhance.Brightness(image)
                factor = 1.0 + (100 - mean_brightness) / 200  # Calculate adjustment factor
                image = enhancer.enhance(min(factor, 1.3))  # Cap at 30% increase
                adjustments.append(f"auto-brighten +{int((factor - 1) * 100)}%")
                logger.info(f"  Auto-adjusted brightness: mean {mean_brightness:.1f} -> brightened")

            elif mean_brightness > 200:
                # Image is too bright, darken it slightly
                enhancer = ImageEnhance.Brightness(image)
                factor = 1.0 - (mean_brightness - 200) / 400  # Calculate adjustment factor
                image = enhancer.enhance(max(factor, 0.9))  # Cap at 10% decrease
                adjustments.append(f"auto-darken -{int((1 - factor) * 100)}%")
                logger.info(f"  Auto-adjusted brightness: mean {mean_brightness:.1f} -> darkened")

            # Check contrast using standard deviation
            std_dev = np.std(img_array)
            if std_dev < 50:
                # Low contrast, enhance it
                enhancer = ImageEnhance.Contrast(image)
                image = enhancer.enhance(1.15)
                adjustments.append("auto-contrast +15%")
                logger.info(f"  Auto-adjusted contrast: std dev {std_dev:.1f} -> enhanced")

        except Exception as e:
            logger.warning(f"  Auto-adjustment skipped: {str(e)}")

        return image, adjustments

    def _optimize_image_size(self, image: PILImage.Image) -> Tuple[PILImage.Image, Dict[str, Any]]:
        """
        Optimize image size for web delivery while maintaining quality
        """
        optimization_info = {}
        max_dimension = 2048  # Maximum dimension for optimal processing

        # Resize if too large
        if max(image.size) > max_dimension:
            ratio = max_dimension / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, PILImage.Resampling.LANCZOS)
            optimization_info['resized'] = True
            optimization_info['resize_dimensions'] = f"{new_size[0]}x{new_size[1]}"
            logger.info(f"  Resized to {new_size[0]}x{new_size[1]} for optimization")
        else:
            optimization_info['resized'] = False

        # Auto-orient based on EXIF data
        try:
            image = ImageOps.exif_transpose(image)
            optimization_info['auto_oriented'] = True
        except:
            optimization_info['auto_oriented'] = False

        return image, optimization_info

    def remove_background(self, image_data: bytes) -> Tuple[bytes, bool]:
        """
        Remove background from product image (placeholder for future feature)

        Note: This would require integration with a background removal service
        like remove.bg API or a local ML model like U2Net
        """
        logger.info("  Background removal requested (feature coming soon)")

        # For now, return original image
        # In production, integrate with remove.bg API or similar
        return image_data, False