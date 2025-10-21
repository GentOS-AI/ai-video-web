"""
Application configuration using pydantic-settings
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_NAME: str = "AIVideo.DIY API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "sqlite:///./aivideo.db"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback"

    # JWT Security
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    BASE_URL: str = "http://localhost:8000"  # Base URL for file URLs

    # AI Models (Placeholder - need real API keys)
    SORA_API_KEY: str = ""
    RUNWAY_API_KEY: str = ""

    # OpenAI Configuration
    OPENAI_API_KEY: str = ""  # From .env

    # Redis & Celery
    REDIS_URL: str = "redis://localhost:6379/0"

    # Video Generation Settings
    VIDEO_OUTPUT_DIR: str = "./uploads/videos"
    SORA_MODEL: str = "sora-2-image-to-video"
    SORA_DURATION: int = 6  # seconds
    SORA_RESOLUTION: str = "1280x720"  # Landscape format

    # Mock Mode for Testing
    USE_MOCK_SORA: bool = True  # Set to False to use real OpenAI API

    # Credits
    DEFAULT_USER_CREDITS: float = 100.0
    # Model-specific credit costs
    SORA_2_COST: float = 100.0  # Sora-2 Standard
    SORA_2_PRO_COST: float = 300.0  # Sora-2 Pro

    # Stripe Payment Configuration
    STRIPE_ENVIRONMENT: str = "development"  # development | production

    # Test Keys
    STRIPE_SECRET_KEY_TEST: str = ""
    STRIPE_PUBLISHABLE_KEY_TEST: str = ""
    STRIPE_WEBHOOK_SECRET_TEST: str = ""

    # Test Price IDs
    STRIPE_BASIC_PRICE_ID_TEST: str = ""
    STRIPE_PRO_PRICE_ID_TEST: str = ""
    STRIPE_CREDITS_PRICE_ID_TEST: str = ""

    # Live Keys
    STRIPE_SECRET_KEY_LIVE: str = ""
    STRIPE_PUBLISHABLE_KEY_LIVE: str = ""
    STRIPE_WEBHOOK_SECRET_LIVE: str = ""

    # Live Price IDs
    STRIPE_BASIC_PRICE_ID_LIVE: str = ""
    STRIPE_PRO_PRICE_ID_LIVE: str = ""
    STRIPE_CREDITS_PRICE_ID_LIVE: str = ""

    # Test Product IDs
    STRIPE_PRODUCT_BASIC_TEST: str = ""
    STRIPE_PRODUCT_PRO_TEST: str = ""
    STRIPE_PRODUCT_CREDITS_TEST: str = ""

    # Live Product IDs
    STRIPE_PRODUCT_BASIC_LIVE: str = ""
    STRIPE_PRODUCT_PRO_LIVE: str = ""
    STRIPE_PRODUCT_CREDITS_LIVE: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Global settings instance
settings = Settings()
