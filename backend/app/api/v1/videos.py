"""
Video generation and management API routes
"""
from typing import Optional
import asyncio
import json
import random
import time
import redis
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user, get_current_user_from_header_or_query
from app.core.config import settings
from app.schemas.video import (
    VideoGenerateRequest,
    VideoResponse,
    VideoListResponse,
    VideoStatusResponse,
    ModelListResponse,
    ModelInfo,
)
from app.models.user import User
from app.models.video import VideoStatus, Video
from app.services import video_service
from app.core.exceptions import (
    InsufficientCreditsException,
    NotFoundException,
    SubscriptionRequiredException,
    SubscriptionExpiredException,
)

router = APIRouter()


@router.post("/generate", response_model=VideoResponse, status_code=status.HTTP_201_CREATED)
def generate_video(
    video_request: VideoGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new video generation task

    Requires authentication and sufficient credits

    This endpoint:
    1. Creates a video record in database
    2. Deducts credits from user account
    3. Triggers async Celery task for video generation
    4. Returns immediately with pending status
    """
    try:
        # Create video record and deduct credits
        video = video_service.create_video_generation_task(db, current_user, video_request)

        # 🔥 Trigger async Celery task for video generation
        from app.tasks.video_generation import generate_video_task
        task = generate_video_task.delay(video.id)

        print(f"✅ Video generation task created: video_id={video.id}, task_id={task.id}")

        return video
    except SubscriptionRequiredException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except SubscriptionExpiredException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except InsufficientCreditsException as e:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=str(e),
        )


@router.get("", response_model=VideoListResponse)
def get_videos(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[VideoStatus] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get current user's video generation history
    """
    skip = (page - 1) * page_size
    videos, total = video_service.get_user_videos(
        db,
        current_user.id,
        skip=skip,
        limit=page_size,
        status=status_filter,
    )

    return VideoListResponse(
        videos=videos,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get specific video details
    """
    try:
        video = video_service.get_video_by_id(db, video_id, current_user.id)
        return video
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a video
    """
    try:
        video_service.delete_video(db, video_id, current_user.id)
        return None
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post("/{video_id}/retry", response_model=VideoResponse)
def retry_video_generation(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retry failed video generation
    """
    try:
        video = video_service.get_video_by_id(db, video_id, current_user.id)

        if video.status != VideoStatus.FAILED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Can only retry failed videos",
            )

        # Reset status to pending
        video = video_service.update_video_status(
            db,
            video_id,
            VideoStatus.PENDING,
            error_message=None,
        )

        return video

    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/models/list", response_model=ModelListResponse)
def get_available_models():
    """
    Get list of available AI models for video generation
    """
    models = video_service.get_available_models()
    return ModelListResponse(
        models=[ModelInfo(**model) for model in models]
    )


@router.get("/{video_id}/stream")
async def stream_video_progress(
    video_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_header_or_query),
):
    """
    SSE endpoint for streaming video generation progress via Redis Pub/Sub

    This endpoint subscribes to a Redis channel (video:{video_id}) and streams
    real-time log messages from the Celery background task to the client.

    Architecture:
        Celery Task → Redis Pub/Sub → This Endpoint → Frontend (SSE)

    Message format:
    {
        "step": 1-9,           # Current step number (9 = completion, -1 = error)
        "message": "...",      # Human-readable status message
        "timestamp": "...",    # ISO timestamp
        "video_url": "...",    # Only present when completed
        "error": "..."         # Only present when failed
    }
    """
    async def event_generator():
        redis_client = None
        pubsub = None

        try:
            # Step 1: Verify video exists and belongs to current user
            video = db.query(Video).filter(Video.id == video_id).first()

            if not video:
                print(f"❌ [SSE] Video {video_id} not found")
                yield f"data: {json.dumps({'error': 'Video not found', 'step': -1})}\n\n"
                return

            if video.user_id != current_user.id:
                print(f"❌ [SSE] Access denied for video {video_id}, user {current_user.id}")
                yield f"data: {json.dumps({'error': 'Access denied', 'step': -1})}\n\n"
                return

            # Step 2: Connect to Redis and subscribe to channel
            channel = f"video:{video_id}"

            try:
                redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
                pubsub = redis_client.pubsub()
                pubsub.subscribe(channel)

                print(f"📡 [SSE] Subscribed to Redis channel: {channel}")

                # Send initial connection message
                yield f"data: {json.dumps({'step': 0, 'message': '🔌 Connected to video stream', 'timestamp': time.time()})}\n\n"

            except redis.ConnectionError as e:
                print(f"❌ [SSE] Redis connection failed: {e}")
                yield f"data: {json.dumps({'error': 'Redis connection failed', 'step': -1, 'message': '❌ Failed to connect to message queue'})}\n\n"
                return

            # Step 3: Listen for messages from Redis
            timeout_seconds = 1800  # 30 minutes max
            start_time = time.time()
            last_heartbeat = time.time()
            heartbeat_interval = 15  # Send heartbeat every 15 seconds

            while True:
                # Check timeout
                elapsed = time.time() - start_time
                if elapsed > timeout_seconds:
                    print(f"⏰ [SSE] Stream timeout after {timeout_seconds}s")
                    yield f"data: {json.dumps({'step': -1, 'error': 'Stream timeout', 'message': '⏰ Connection timeout after 30 minutes'})}\n\n"
                    break

                # Send heartbeat to keep connection alive
                if time.time() - last_heartbeat > heartbeat_interval:
                    yield f": heartbeat\n\n"
                    last_heartbeat = time.time()

                # Non-blocking get message (1 second timeout)
                message = pubsub.get_message(timeout=1.0)

                if message and message['type'] == 'message':
                    # Got a real message from Redis
                    data_str = message['data']

                    print(f"📨 [SSE] Received message: {data_str[:100]}...")

                    # Forward to client
                    yield f"data: {data_str}\n\n"

                    # Parse message to check if done
                    try:
                        parsed = json.loads(data_str)

                        # Check for completion (step 9 or status="completed")
                        if parsed.get('status') == 'completed' or parsed.get('step') == 9:
                            print(f"✅ [SSE] Video {video_id} completed, closing stream")
                            break

                        # Check for error (step -1 or status="failed")
                        if parsed.get('step') == -1 or parsed.get('status') == 'failed':
                            print(f"❌ [SSE] Video {video_id} failed, closing stream")
                            break

                    except json.JSONDecodeError:
                        print(f"⚠️  [SSE] Failed to parse message as JSON: {data_str}")

                # Small sleep to prevent busy loop
                await asyncio.sleep(0.1)

            print(f"🏁 [SSE] Stream ended for video {video_id}")

        except Exception as e:
            import traceback
            print(f"❌ [SSE] Unexpected error: {e}")
            print(traceback.format_exc())
            yield f"data: {json.dumps({'step': -1, 'error': str(e), 'message': f'❌ Stream error: {str(e)}'})}\n\n"

        finally:
            # Cleanup
            if pubsub:
                try:
                    pubsub.unsubscribe()
                    pubsub.close()
                    print(f"🔌 [SSE] Unsubscribed from channel")
                except Exception as e:
                    print(f"⚠️  [SSE] Error during cleanup: {e}")

            if redis_client:
                try:
                    redis_client.close()
                except Exception as e:
                    print(f"⚠️  [SSE] Error closing Redis connection: {e}")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable buffering for nginx
            "Access-Control-Allow-Origin": "*",  # CORS for SSE
        }
    )
