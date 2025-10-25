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

    # Database (PostgreSQL - must be set in .env)
    DATABASE_URL: str

    # Database Connection Pool Settings (PostgreSQL only)
    DB_POOL_SIZE: int = 5  # Number of connections in pool
    DB_MAX_OVERFLOW: int = 10  # Maximum overflow connections
    DB_POOL_PRE_PING: bool = True  # Enable connection health checks
    DB_POOL_RECYCLE: int = 3600  # Recycle connections after 1 hour (seconds)

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
    USE_MOCK_SORA: bool = False  # Set to False to use real OpenAI API

    # Credits
    DEFAULT_USER_CREDITS: float = 100.0

    # Script Generation Credits (统一扣除)
    SCRIPT_GENERATION_COST: float = 10.0  # 所有模型+时长统一10积分

    # Video Generation Credits - Sora 2 (按时长差异化)
    SORA_2_4S_COST: float = 40.0   # 4秒视频
    SORA_2_8S_COST: float = 80.0   # 8秒视频
    SORA_2_12S_COST: float = 120.0 # 12秒视频

    # Video Generation Credits - Sora 2 Pro (Sora2的3倍)
    SORA_2_PRO_4S_COST: float = 120.0  # 4秒视频 (40*3)
    SORA_2_PRO_8S_COST: float = 240.0  # 8秒视频 (80*3)
    SORA_2_PRO_12S_COST: float = 360.0 # 12秒视频 (120*3)

    # Legacy costs (向后兼容,作为fallback)
    SORA_2_COST: float = 100.0  # Sora-2 Standard (deprecated, use duration-based)
    SORA_2_PRO_COST: float = 300.0  # Sora-2 Pro (deprecated, use duration-based)

    # Stripe Payment Configuration
    STRIPE_ENVIRONMENT: str = "development"  # development | production

    # Test Keys
    STRIPE_SECRET_KEY_TEST: str = ""
    STRIPE_PUBLISHABLE_KEY_TEST: str = ""
    STRIPE_WEBHOOK_SECRET_TEST: str = ""

    # Test Price IDs
    STRIPE_BASIC_PRICE_ID_TEST: str = ""
    STRIPE_PREMIUM_PRICE_ID_TEST: str = ""
    STRIPE_CREDITS_PRICE_ID_TEST: str = ""

    # Live Keys
    STRIPE_SECRET_KEY_LIVE: str = ""
    STRIPE_PUBLISHABLE_KEY_LIVE: str = ""
    STRIPE_WEBHOOK_SECRET_LIVE: str = ""

    # Live Price IDs
    STRIPE_BASIC_PRICE_ID_LIVE: str = ""
    STRIPE_PREMIUM_PRICE_ID_LIVE: str = ""
    STRIPE_CREDITS_PRICE_ID_LIVE: str = ""

    # Test Product IDs
    STRIPE_PRODUCT_BASIC_TEST: str = ""
    STRIPE_PRODUCT_PREMIUM_TEST: str = ""
    STRIPE_PRODUCT_CREDITS_TEST: str = ""

    # Live Product IDs
    STRIPE_PRODUCT_BASIC_LIVE: str = ""
    STRIPE_PRODUCT_PREMIUM_LIVE: str = ""
    STRIPE_PRODUCT_CREDITS_LIVE: str = ""

    # ========================================
    # Google Cloud Storage Configuration
    # ========================================
    # ⚠️  GCS 现在是唯一的存储方式 (已移除 USE_GCS_STORAGE 开关)

    # GCS 项目配置
    GOOGLE_CLOUD_PROJECT: str = ""
    GOOGLE_CLOUD_BUCKET: str = ""

    # GCS 认证
    GOOGLE_APPLICATION_CREDENTIALS: str = ""  # JSON 文件路径
    GOOGLE_CLOUD_CREDENTIALS_JSON: str = ""   # JSON 内容字符串 (优先级高于文件路径)

    # GCS 公开 URL 配置
    GCS_PUBLIC_URL_BASE: str = "https://storage.googleapis.com"
    GCS_FOLDER_PREFIX: str = "video4ads"  # 文件夹前缀

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )


# Global settings instance
settings = Settings()
