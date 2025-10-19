"""
Pydantic schemas for enhanced AI API endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class EnhancedScriptRequest(BaseModel):
    """Request model for enhanced script generation"""
    product_description: Optional[str] = Field(
        None,
        description="User's product description (optional)",
        max_length=1000
    )
    ad_intention: Optional[str] = Field(
        None,
        description="User's advertising intention or goals (optional)",
        max_length=1000
    )
    duration: int = Field(
        4,
        description="Target video duration in seconds",
        ge=1,
        le=60
    )
    language: str = Field(
        "en",
        description="Language for script generation (en, zh, zh-TW, ja, etc.)",
        pattern="^[a-z]{2}(-[A-Z]{2})?$"
    )
    enhancement_mode: str = Field(
        "standard",
        description="Image enhancement mode",
        pattern="^(standard|professional|creative)$"
    )


class ProductAnalysis(BaseModel):
    """Product analysis details from AI"""
    product_type: Optional[str] = Field(None, description="Identified product category")
    key_features: List[str] = Field(default_factory=list, description="Key product features")
    target_audience: Optional[str] = Field(None, description="Primary target demographic")
    unique_selling_points: List[str] = Field(default_factory=list, description="Unique selling propositions")
    market_position: Optional[str] = Field(None, description="Market positioning (premium/mid-range/budget)")
    emotional_appeal: Optional[str] = Field(None, description="Primary emotion to evoke")


class EnhancementDetails(BaseModel):
    """Details about image enhancements applied"""
    mode: str = Field(..., description="Enhancement mode used")
    original_size_kb: float = Field(..., description="Original image size in KB")
    enhanced_size_kb: float = Field(..., description="Enhanced image size in KB")
    original_dimensions: str = Field(..., description="Original image dimensions (WxH)")
    enhanced_dimensions: str = Field(..., description="Enhanced image dimensions (WxH)")
    adjustments: List[str] = Field(default_factory=list, description="List of adjustments applied")
    size_reduction: Optional[str] = Field(None, description="Percentage size reduction")
    resized: bool = Field(False, description="Whether image was resized")
    auto_oriented: bool = Field(False, description="Whether image was auto-oriented")


class EnhancedScriptResponse(BaseModel):
    """Response model for enhanced script generation"""
    script: str = Field(
        ...,
        description="Complete advertising video script",
        min_length=50
    )
    enhanced_image_url: str = Field(
        ...,
        description="URL of the enhanced image"
    )
    enhancement_details: EnhancementDetails = Field(
        ...,
        description="Details about image enhancements applied"
    )
    product_analysis: Dict[str, Any] = Field(
        default_factory=dict,
        description="AI analysis of the product"
    )
    style: Optional[str] = Field(
        None,
        description="Recommended video style keywords"
    )
    camera: Optional[str] = Field(
        None,
        description="Recommended camera movements"
    )
    lighting: Optional[str] = Field(
        None,
        description="Recommended lighting setup"
    )
    tokens_used: int = Field(
        0,
        description="Number of tokens consumed by GPT-4o"
    )
    processing_time: float = Field(
        ...,
        description="Total processing time in seconds"
    )
    user_input_used: bool = Field(
        False,
        description="Whether user provided input was used"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "script": "Opening with a dramatic close-up of the sleek smartphone, camera slowly pulls back revealing its premium metallic finish. Soft studio lighting creates elegant reflections across the curved edges. The screen illuminates, showcasing vibrant colors as the device rotates 360°, highlighting the triple-camera system. Quick cuts demonstrate key features: lightning-fast unlocking, smooth app transitions, and stunning photo capabilities. Final shot frames the phone against a minimalist backdrop with subtle glow effect, as the brand logo fades in. Modern, sophisticated aesthetic throughout.",
                "enhanced_image_url": "http://localhost:8000/uploads/user_1/enhanced/enhanced_abc123.jpg",
                "enhancement_details": {
                    "mode": "professional",
                    "original_size_kb": 2048.5,
                    "enhanced_size_kb": 1856.3,
                    "original_dimensions": "3000x2000",
                    "enhanced_dimensions": "2048x1365",
                    "adjustments": ["brightness +8%", "contrast +15%", "color +15%", "sharpness +10%", "unsharp mask"],
                    "size_reduction": "9.4%",
                    "resized": True,
                    "auto_oriented": True
                },
                "product_analysis": {
                    "product_type": "smartphone",
                    "key_features": ["premium metallic finish", "triple-camera system", "curved display"],
                    "target_audience": "tech-savvy professionals aged 25-45",
                    "unique_selling_points": ["advanced camera capabilities", "sleek design", "fast performance"],
                    "market_position": "premium",
                    "emotional_appeal": "aspiration and innovation"
                },
                "style": "modern, sophisticated, minimalist",
                "camera": "close-up, pull back, 360° rotation",
                "lighting": "soft studio, elegant reflections",
                "tokens_used": 1250,
                "processing_time": 3.45,
                "user_input_used": True
            }
        }