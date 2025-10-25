# Video4Ads Backend

FastAPI + Celery + Redis backend for AI video generation platform.

## 🎯 Overview

Production-ready backend API with:
- OpenAI Sora 2 integration for AI video generation
- Google OAuth authentication
- Stripe payment processing
- Real-time progress updates via Server-Sent Events (SSE)
- Async task processing with Celery
- Comprehensive API documentation

---

## 📊 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/SSE
         ↓
┌─────────────────┐      ┌──────────────┐
│   FastAPI       │◄────►│   Redis      │
│   (REST API)    │      │   (Pub/Sub)  │
└────────┬────────┘      └──────────────┘
         │                       ▲
         │ Queue Tasks           │
         ↓                       │
┌─────────────────┐              │
│   Celery        │──────────────┘
│   (Workers)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      ┌──────────────┐
│   SQLite/       │      │   OpenAI     │
│   PostgreSQL    │      │   Sora 2 API │
└─────────────────┘      └──────────────┘
```

---

## 📊 Feature Implementation Status

### ✅ Core Features (100%)

#### Authentication & Authorization
- ✅ Google OAuth 2.0 integration
- ✅ JWT token generation and validation
- ✅ Refresh token mechanism
- ✅ User session management

#### Video Generation
- ✅ OpenAI Sora 2 API integration
- ✅ Image-to-video generation (4s, 8s, 12s)
- ✅ Support for multiple resolutions
- ✅ Async task processing with Celery
- ✅ Real-time progress updates via SSE
- ✅ Automatic retry mechanism

#### Payment System (Stripe)
- ✅ Checkout Session creation
- ✅ Subscription management (Basic/Pro)
- ✅ One-time credits purchase
- ✅ Webhook event processing
- ✅ Environment-aware pricing

**Backend Completion**: 🎉 **100%** (Production Ready)

See full documentation in this README.

---

## 🗄️ Database Schema

### Tables Overview

The database uses SQLAlchemy ORM with SQLite (production-ready for PostgreSQL migration).

#### 1. **users** - User accounts and credits
```python
users:
  - id: Integer (Primary Key)
  - email: String (Unique, Indexed)
  - name: String
  - picture: String (Profile photo URL)
  - credits: Integer (Default: 50)
  - is_subscriber: Boolean (Default: False)
  - subscription_expires_at: DateTime (Nullable)
  - last_login_bonus_date: Date (Nullable)
  - stripe_customer_id: String (Nullable)
  - created_at: DateTime (Auto)
  - updated_at: DateTime (Auto)
```

#### 2. **uploaded_images** - User uploaded images
```python
uploaded_images:
  - id: Integer (Primary Key)
  - user_id: Integer (Foreign Key → users.id, ondelete=CASCADE)
  - file_path: String (Local path for reference)
  - storage_url: String (GCS public URL) ← PRIMARY SOURCE
  - created_at: DateTime (Auto)

  # Relationship: user (back_populates="uploaded_images")
```

#### 3. **generated_scripts** - AI-generated video scripts (NEW)
```python
generated_scripts:
  - id: Integer (Primary Key)
  - user_id: Integer (Foreign Key → users.id, ondelete=CASCADE)
  - image_id: Integer (Foreign Key → uploaded_images.id, ondelete=SET NULL)
  - script_text: Text (Generated script content)
  - credits_used: Integer (Always 10 credits)
  - created_at: DateTime (Auto)

  # Relationships:
  # - user (back_populates="generated_scripts")
  # - image (back_populates="generated_scripts")
  # - videos (back_populates="script")
```

**Purpose**: Complete data lineage tracking from image → script → video
- Enables script history and regeneration
- Tracks credits spent on script generation separately
- Supports future features like script versioning

#### 4. **videos** - Generated videos
```python
videos:
  - id: Integer (Primary Key)
  - user_id: Integer (Foreign Key → users.id, ondelete=CASCADE)
  - image_id: Integer (Foreign Key → uploaded_images.id, ondelete=SET NULL)
  - script_id: Integer (Foreign Key → generated_scripts.id, ondelete=SET NULL) ← NEW!
  - prompt: Text (Video generation prompt)
  - status: String (pending/processing/completed/failed)
  - file_path: String (Local path for reference)
  - video_url: String (GCS public URL) ← PRIMARY SOURCE
  - model: String (sora-2, sora-2-pro)
  - duration: Integer (4, 8, 12 seconds)
  - credits_used: Integer (40/160/360)
  - celery_task_id: String (Nullable)
  - error_message: Text (Nullable)
  - created_at: DateTime (Auto)
  - completed_at: DateTime (Nullable)

  # Relationships:
  # - user (back_populates="videos")
  # - image (back_populates="videos")
  # - script (back_populates="videos") ← NEW!
```

### Data Relationship Flow

```
User Upload Image
       ↓
[uploaded_images] (stores GCS URL)
       ↓
Generate Script (10 credits)
       ↓
[generated_scripts] (links to image_id)
       ↓
Generate Video (40-360 credits)
       ↓
[videos] (links to both image_id and script_id)
```

### Foreign Key Relationships

```
users (1) ←──── (N) uploaded_images
users (1) ←──── (N) generated_scripts
users (1) ←──── (N) videos

uploaded_images (1) ←──── (N) generated_scripts
uploaded_images (1) ←──── (N) videos

generated_scripts (1) ←──── (N) videos
```

### Migration Files

Database optimization completed with migration:
- `backend/migrations/add_script_id_to_videos.py` - Adds script_id foreign key to videos table

**Benefits**:
- ✅ Complete audit trail from upload to final video
- ✅ Query all videos generated from a specific script
- ✅ Support for script regeneration without re-upload
- ✅ Track total credits spent per image/script combination
- ✅ Enable analytics on script effectiveness

---

## ☁️ Google Cloud Storage Integration

### Overview

**Status**: ✅ **100% Complete** - All files stored in GCS, local storage removed

The backend now uses Google Cloud Storage exclusively for all file storage (images and videos).

### Features

- ✅ Automatic upload to GCS bucket
- ✅ Public URL generation (no signed URLs needed)
- ✅ UUID-based file naming for uniqueness
- ✅ Bucket lifecycle management
- ✅ 21 existing videos migrated to GCS

### Configuration

**Environment Variables**:
```bash
# Required for GCS
GCS_BUCKET_NAME=your-bucket-name
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

**Service Account Permissions**:
- `Storage Object Creator` (upload files)
- `Storage Object Viewer` (read files)
- `Storage Object Admin` (delete files) - optional

### Storage Flow

#### Image Upload
```python
1. User uploads image via /api/v1/ai/upload-image
2. Backend saves to GCS: uploads/{user_id}/{uuid}_{filename}
3. Set file to public-read
4. Get public URL: https://storage.googleapis.com/{bucket}/...
5. Store URL in uploaded_images.storage_url
6. Return public URL to frontend
```

#### Video Generation
```python
1. Celery task generates video via Sora 2 API
2. Download video from OpenAI
3. Upload to GCS: videos/{user_id}/{uuid}_{timestamp}.mp4
4. Set file to public-read
5. Get public URL
6. Store URL in videos.video_url
7. Update video status to 'completed'
```

### File Paths

**GCS Structure**:
```
gs://your-bucket-name/
├── uploads/           # User uploaded images
│   └── {user_id}/
│       └── {uuid}_{filename}.jpg
└── videos/            # Generated videos
    └── {user_id}/
        └── {uuid}_{timestamp}.mp4
```

**Example URLs**:
```
https://storage.googleapis.com/your-bucket/uploads/123/abc-123_image.jpg
https://storage.googleapis.com/your-bucket/videos/123/def-456_1672531200.mp4
```

### Code Reference

- **Upload Service**: `backend/app/services/storage_service.py`
  - `upload_file_to_gcs()` - Upload with public URL
  - `delete_file_from_gcs()` - Delete from bucket
  - `get_public_url()` - Get public URL

- **Integration Points**:
  - `backend/app/api/v1/ai.py` - Image upload endpoint
  - `backend/app/tasks/video_generation.py` - Video upload in Celery task

### Migration Status

✅ **Completed**: 21 videos migrated from local storage to GCS
- Migration script: `backend/migrations/migrate_videos_to_gcs.py`
- All video URLs updated in database
- Local files kept as backup

### Removed Code

- ❌ `USE_GCS_STORAGE` environment variable (no longer needed)
- ❌ Local storage fallback logic (GCS-only now)
- ❌ `make_public()` method (replaced with ACL during upload)

---

## 💳 Credit System

### Credit Pricing

| Operation | Credits | Notes |
|-----------|---------|-------|
| **Script Generation** | 10 | GPT-4o API call |
| **Video (1 video, 4s)** | 40 | Sora 2 API - one video |
| **Video (9 videos, 4s)** | 360 | Sora 2 API - batch generation |

### Credit Flow

1. **User Registration**: 50 credits
2. **Daily Login Bonus**: +10 credits (24-hour cooldown)
3. **Script Generation**: -10 credits (stored in `generated_scripts.credits_used`)
4. **Video Generation**: -40 or -360 credits (stored in `videos.credits_used`)

### Credit Deduction Logic

**Script Generation** (`/api/v1/ai/generate-script`):
```python
1. Check user credits >= 10
2. Deduct 10 credits (with transaction rollback on error)
3. Call OpenAI GPT-4o API
4. Save script to generated_scripts table
5. Return script to frontend
```

**Video Generation** (`/api/v1/ai/generate-video`):
```python
1. Calculate credits needed (40 or 360)
2. Check user credits >= required
3. Deduct credits (with transaction rollback on error)
4. Queue Celery task
5. Task calls Sora 2 API
6. On success: Upload to GCS, update video status
7. On failure: Refund credits, mark video as failed
```

### Error Handling

- ✅ Automatic credit refund on video generation failure
- ✅ Database transaction rollback on errors
- ✅ Detailed error messages stored in `videos.error_message`

