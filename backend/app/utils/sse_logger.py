"""
SSE Logger - Real-time log streaming via Redis Pub/Sub

This utility enables Celery background tasks to push real-time progress updates
to frontend clients via Server-Sent Events (SSE).

Architecture:
    Celery Task → Redis Pub/Sub → FastAPI SSE Endpoint → Frontend Browser

Usage:
    from app.utils.sse_logger import SSELogger

    logger = SSELogger(video_id=123)
    logger.publish(1, "🔍 Validating parameters...")
    logger.publish_progress(5, "⏳ Processing...", progress=75)
    logger.publish_completion("/uploads/videos/video.mp4")
    logger.close()
"""
import json
import redis
from datetime import datetime
from typing import Dict, Any, Optional
from app.core.config import settings


class SSELogger:
    """
    SSE Logger for pushing real-time logs via Redis Pub/Sub

    Each video generation task gets its own Redis channel: video:{video_id}
    The SSE endpoint subscribes to this channel and streams messages to the client.
    """

    def __init__(self, video_id: int):
        """
        Initialize SSE logger for a specific video

        Args:
            video_id: Database ID of the video being generated
        """
        self.video_id = video_id
        self.channel = f"video:{video_id}"
        self.redis_client = None

        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Test connection
            self.redis_client.ping()
            print(f"📡 [SSELogger] Initialized for video {video_id}, channel: {self.channel}")
        except redis.ConnectionError as e:
            print(f"❌ [SSELogger] Failed to connect to Redis: {e}")
            print(f"   Make sure Redis is running: redis-server")
            self.redis_client = None
        except Exception as e:
            print(f"❌ [SSELogger] Unexpected error: {e}")
            self.redis_client = None

    def publish(self, step: int, message: str, **kwargs) -> bool:
        """
        Publish a log message to Redis channel

        Args:
            step: Step number (1-8 for normal steps, 9 for completion, -1 for error)
            message: Human-readable log message
            **kwargs: Additional fields (e.g., progress, video_url, error)

        Returns:
            bool: True if published successfully, False otherwise
        """
        if not self.redis_client:
            print(f"⚠️  [SSELogger] Redis not connected, skipping publish: [{step}] {message}")
            return False

        data = {
            "step": step,
            "message": message,
            "timestamp": datetime.utcnow().isoformat(),
            **kwargs
        }

        try:
            # Publish to Redis channel
            num_subscribers = self.redis_client.publish(self.channel, json.dumps(data))

            # Log to console
            print(f"📤 [SSELogger][Step {step}] {message} (subscribers: {num_subscribers})")

            return True

        except redis.RedisError as e:
            print(f"❌ [SSELogger] Redis error while publishing: {e}")
            return False
        except Exception as e:
            print(f"❌ [SSELogger] Unexpected error while publishing: {e}")
            return False

    def publish_progress(self, step: int, message: str, progress: int) -> bool:
        """
        Publish a progress update with percentage

        Args:
            step: Step number
            message: Progress message
            progress: Progress percentage (0-100)

        Returns:
            bool: Success status
        """
        return self.publish(step, message, progress=progress)

    def publish_completion(self, video_url: str, video_path: Optional[str] = None) -> bool:
        """
        Publish video generation completion message

        Args:
            video_url: Relative URL to access the video (/uploads/videos/xxx.mp4)
            video_path: Optional local file path

        Returns:
            bool: Success status
        """
        data = {
            "video_url": video_url,
            "status": "completed"
        }

        if video_path:
            data["video_path"] = video_path

        return self.publish(
            step=9,
            message="🎉 Video generation completed successfully!",
            **data
        )

    def publish_error(self, error_message: str, step: int = -1) -> bool:
        """
        Publish error message

        Args:
            error_message: Error description
            step: Step number where error occurred (-1 for general error)

        Returns:
            bool: Success status
        """
        return self.publish(
            step=step,
            message=f"❌ Error: {error_message}",
            error=error_message,
            status="failed"
        )

    def close(self):
        """
        Close Redis connection

        Should be called when done publishing (e.g., in finally block)
        """
        if self.redis_client:
            try:
                self.redis_client.close()
                print(f"🔌 [SSELogger] Redis connection closed for video {self.video_id}")
            except Exception as e:
                print(f"⚠️  [SSELogger] Error closing Redis connection: {e}")
            finally:
                self.redis_client = None

    def __enter__(self):
        """Context manager support"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager support - auto close"""
        self.close()
        return False  # Don't suppress exceptions


# Convenience function for one-off messages
def send_sse_log(video_id: int, step: int, message: str, **kwargs) -> bool:
    """
    Send a single SSE log message without keeping connection open

    Args:
        video_id: Video ID
        step: Step number
        message: Log message
        **kwargs: Additional fields

    Returns:
        bool: Success status
    """
    with SSELogger(video_id) as logger:
        return logger.publish(step, message, **kwargs)
