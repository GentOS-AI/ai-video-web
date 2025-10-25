# AIVideo.DIY - AI-Powered Video Generation Platform

A professional, minimalist AI video generation website built with Next.js 14+, designed for businesses and marketers to create stunning advertising videos using Sora 2 AI technology.

## Features

- **Modern Design**: Clean white background with purple gradient accents for a professional, tech-forward aesthetic
- **AI Video Generation**: Powered by Sora 2 technology for creating professional advertising videos
- **Responsive Design**: Mobile-first approach with full responsive support
- **SEO Optimized**: Complete meta tags, structured data, and sitemap for search engines
- **Interactive UI**: Smooth animations with Framer Motion
- **User-Friendly**: Intuitive interface with drag-drop file upload and sample images

## Tech Stack

- **Framework**: Next.js 15.5.5 (App Router)
- **Language**: TypeScript (Strict Mode with Enhanced Type Checking)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Geist Sans & Geist Mono

### TypeScript Configuration
- ✅ Strict type checking enabled
- ✅ Build fails on type errors (`ignoreBuildErrors: false`)
- ✅ Enhanced compiler options for maximum type safety
- 📄 See [TYPESCRIPT_CONFIG.md](TYPESCRIPT_CONFIG.md) for details

## Project Structure

```
ai-video-web/
├── app/
│   ├── layout.tsx        # Root layout with SEO metadata
│   ├── page.tsx          # Homepage
│   ├── globals.css       # Global styles & theme
│   └── sitemap.ts        # Dynamic sitemap
├── components/
│   ├── Navbar.tsx        # Navigation bar
│   ├── HeroSection.tsx   # Main hero section with form
│   ├── ShowcaseSection.tsx # Video showcase grid
│   ├── Footer.tsx        # Footer component
│   ├── Button.tsx        # Reusable button component
│   ├── VideoPlayer.tsx   # Video player with controls
│   └── UploadButton.tsx  # Image upload with drag-drop
├── lib/
│   └── utils.ts          # Utility functions
└── public/
    └── robots.txt        # SEO robots file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-video-web
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev        # Default port 3000
npm run dev -- -p 8080  # Custom port 8080
```

4. Open [http://localhost:3000](http://localhost:3000) (or your custom port) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## Design System

### Color Palette
- **Primary**: Purple gradient (#8B5CF6 → #A855F7 → #C084FC)
- **Background**: White (#FFFFFF)
- **Text**: Dark (#1A1A1A, #333333)
- **Accent**: Light purple (#F5F3FF)

### Typography
- **Headings**: Geist Sans (Bold)
- **Body**: Geist Sans (Regular)
- **Optimized for**: Readability and professional appearance

## Key Components

### Navbar
- Sticky navigation with logo
- Responsive hamburger menu for mobile
- Login button transforms to avatar when logged in

### Hero Section
- Two-column layout (form + video carousel)
- Prompt input with character counter
- Free trial sample images
- Drag-drop file upload
- Sora 2 model badge
- Video carousel with navigation

### Showcase Section
- Responsive grid layout
- Hover effects and animations
- Category badges
- Scroll-triggered animations

### Footer
- Three-column layout
- Social media links
- Quick navigation links
- Purple gradient divider

## SEO Features

- Comprehensive meta tags
- Open Graph for social sharing
- Twitter Card support
- Structured data ready
- Sitemap generation
- Robots.txt configuration
- Mobile-optimized viewport

## Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## Current Implementation Status

### ✅ Completed Features

#### Frontend (Next.js 15.5.5)
- ✅ Modern responsive UI with purple gradient theme
- ✅ Hero section with video carousel and interactive indicators
- ✅ Google OAuth authentication integration
- ✅ Real-time video generation with SSE streaming
- ✅ Toast notifications for user feedback
- ✅ Subscription system with pricing modal
- ✅ High-resolution image selection (1280x720) for AI generation
- ✅ Animated logo and smooth transitions
- ✅ Mobile-first responsive design
- ✅ **My Videos Page** - Complete video management dashboard
  - Video list with pagination (20 items per page)
  - Status filtering (All/Pending/Processing/Completed/Failed)
  - Auto-refresh for processing videos (every 10 seconds)
  - Video playback modal with full details
  - Delete and retry functionality
  - Responsive grid layout (3→2→1 columns)
  - Background task persistence (continue viewing even after page close)

#### Backend (FastAPI + Celery)
- ✅ **OpenAI Sora 2 API Integration** - Real AI video generation
- ✅ Google OAuth authentication
- ✅ JWT token-based authorization
- ✅ SQLite database with SQLAlchemy ORM
- ✅ Celery + Redis for async task processing
- ✅ Server-Sent Events (SSE) for real-time progress updates
- ✅ User credits and subscription management
- ✅ Video generation with streaming download support
- ✅ CORS configuration for frontend integration
- ✅ **Google Cloud Storage (GCS) Integration** - All files stored in cloud
  - 21 existing videos migrated to GCS bucket
  - Automatic public URL generation
  - Scalable and secure cloud storage
  - Local storage mode removed (GCS-only)
- ✅ **Database Optimization** - Complete data lineage tracking
  - New `generated_scripts` table with foreign keys
  - Full relationship chain: uploaded_images → generated_scripts → videos
  - Enhanced query performance with proper indexing
  - Script history and regeneration support

#### Video Generation Pipeline
- ✅ Image-to-video using OpenAI Sora 2 API
- ✅ Support for 4s, 8s, 12s video durations
- ✅ 1280x720 HD video output
- ✅ Automatic retry mechanism with task queue
- ✅ Real-time progress logging via SSE
- ✅ Video file storage and URL generation
- ✅ Database persistence of generation metadata

### 📊 System Architecture

```
Frontend (Next.js)     Backend (FastAPI)      AI Service
     │                      │                     │
     ├─ Login ───────────>  │                     │
     │                      ├─ OAuth              │
     │                      │                     │
     ├─ Generate ────────>  │                     │
     │                      ├─ Queue Task ────>   │
     │                      │   (Celery)          │
     │                      │                     │
     │  <───── SSE ───────  ├─ Poll Status        │
     │  (Progress)          │                     │
     │                      │  <─── API ────────  │
     │                      │  (Sora 2)      OpenAI
     │                      │                     │
     ├─ My Videos ───────>  │                     │
     │  <─── List ────────  ├─ Query DB           │
     │                      │                     │
     │  <─── Play ────────  ├─ Serve File         │
     │                      │                     │
     └─ Delete/Retry ────>  └─ Update DB          │
```

### 🗄️ Database Schema & Data Lineage

Complete data relationship tracking from image upload to video generation:

```
users
  ├─ id (Primary Key)
  ├─ email, name, picture
  ├─ credits, is_subscriber
  └─ last_login_bonus_date

uploaded_images
  ├─ id (Primary Key)
  ├─ user_id (Foreign Key → users.id)
  ├─ file_path, storage_url
  └─ created_at
       │
       ▼
generated_scripts (NEW - Database Optimization)
  ├─ id (Primary Key)
  ├─ user_id (Foreign Key → users.id)
  ├─ image_id (Foreign Key → uploaded_images.id)
  ├─ script_text, credits_used
  └─ created_at
       │
       ▼
videos
  ├─ id (Primary Key)
  ├─ user_id (Foreign Key → users.id)
  ├─ image_id (Foreign Key → uploaded_images.id)
  ├─ script_id (Foreign Key → generated_scripts.id) NEW!
  ├─ status (pending/processing/completed/failed)
  ├─ file_path, video_url (GCS)
  ├─ credits_used, duration
  └─ created_at, completed_at
```

**Data Flow:**
1. User uploads image → `uploaded_images` (stores GCS URL)
2. Generate script → `generated_scripts` (links to image_id, costs 10 credits)
3. Generate video → `videos` (links to both image_id and script_id, costs 40-360 credits)

**Benefits:**
- ✅ Complete audit trail from upload to final video
- ✅ Support for script regeneration without re-upload
- ✅ Query all videos generated from a specific image
- ✅ Track total credits spent per image/script
- ✅ Enable future features like script versioning

### 🔧 Configuration

- **Models**: `sora-2`, `sora-2-pro`
- **Durations**: 4s, 8s, 12s
- **Resolution**: 1280x720 (16:9 landscape)
- **Input Format**: JPEG, PNG, WebP (1280x720 recommended)
- **Output Format**: MP4

### 📝 Environment Variables

See `.env.example` for required configuration:
- `OPENAI_API_KEY` - OpenAI API key for Sora 2
- `GOOGLE_CLIENT_ID` - Google OAuth credentials
- `JWT_SECRET_KEY` - JWT token signing key
- `REDIS_URL` - Redis connection for Celery
- `DATABASE_URL` - SQLite database path
- `GCS_BUCKET_NAME` - Google Cloud Storage bucket name
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to GCS service account JSON file

### ✅ Payment System (Stripe Integration)
- ✅ **Complete Stripe Checkout Integration**
  - Backend: 7 files, 1,184 lines of code
  - Frontend: 9 files, 800+ lines of code
  - Total: ~2,300 lines of production-grade payment code
- ✅ **Subscription Plans**
  - Basic Plan: $29.99/month (500 credits) | Test: $0.50
  - Pro Plan: $129.99/year (3000 credits) | Test: $1.00
  - Environment-aware pricing (dev/prod)
- ✅ **Credits Purchase**
  - 1000 credits pack: $49.99 | Test: $0.50
  - One-time payment, no expiration
- ✅ **Payment Features**
  - Stripe Checkout redirect integration
  - Webhook event processing (6 event types)
  - Automatic database updates after payment
  - Payment success/cancel pages
  - Real-time user data refresh
  - Secure webhook signature verification
- ✅ **UI Components**
  - PricingModal with Stripe integration
  - CreditsModal with Stripe integration
  - Payment success page with transaction details
  - Payment cancel page with retry option
  - Test mode indicators in development
- ✅ **Documentation**
  - [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - Platform configuration
  - [BACKEND_TESTING_GUIDE.md](BACKEND_TESTING_GUIDE.md) - API testing guide
  - [STRIPE_INTEGRATION_SUMMARY.md](STRIPE_INTEGRATION_SUMMARY.md) - Integration summary

### 📊 Overall Project Progress

| Feature | Status | Progress |
|---------|--------|----------|
| **Frontend Core** | ✅ Complete | 100% |
| UI/UX Design | ✅ Complete | 100% |
| Authentication | ✅ Complete | 100% |
| Video Generation | ✅ Complete | 100% |
| Media Center | ✅ Complete | 100% |
| Real-time Updates (SSE) | ✅ Complete | 100% |
| **Backend Core** | ✅ Complete | 100% |
| REST API | ✅ Complete | 100% |
| Database & ORM | ✅ Complete | 100% |
| Database Optimization | ✅ Complete | 100% |
| Task Queue (Celery) | ✅ Complete | 100% |
| Sora 2 Integration | ✅ Complete | 100% |
| **Storage System** | ✅ Complete | 100% |
| Google Cloud Storage | ✅ Complete | 100% |
| Video Migration to GCS | ✅ Complete | 100% |
| **Payment System** | ✅ Complete | 100% |
| Stripe Checkout | ✅ Complete | 100% |
| Webhook Processing | ✅ Complete | 100% |
| Subscription Management | ✅ Complete | 100% |
| Credits Purchase | ✅ Complete | 100% |
| **Documentation** | ✅ Complete | 100% |
| Setup Guides | ✅ Complete | 100% |
| Testing Guides | ✅ Complete | 100% |
| API Documentation | ✅ Complete | 100% |

**Overall Completion**: 🎉 **100%** (Production Ready)

### 🚀 Quick Start

**Prerequisites:**
- Node.js 18+
- Python 3.9+
- Redis server
- OpenAI API key (for Sora 2)
- Stripe account (for payments)
- Google OAuth credentials

**Start Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# In another terminal, start Celery worker
celery -A app.core.celery_app worker --loglevel=info

# For local payment testing, start Stripe CLI
stripe listen --forward-to http://localhost:8000/api/v1/webhooks/stripe
```

**Start Frontend:**
```bash
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 📚 Documentation

- [GETTING_STARTED.md](GETTING_STARTED.md) - Detailed setup guide
- [TYPESCRIPT_CONFIG.md](TYPESCRIPT_CONFIG.md) - TypeScript configuration
- [DESIGN_SPEC.md](DESIGN_SPEC.md) - Design system specification
- [ASSETS_GUIDE.md](ASSETS_GUIDE.md) - Asset management guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical documentation
- [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md) - Stripe configuration
- [BACKEND_TESTING_GUIDE.md](BACKEND_TESTING_GUIDE.md) - Backend testing
- [Backend README](backend/README.md) - Backend-specific documentation

## Future Enhancements

- [ ] Advanced video editing options
- [ ] Multi-language UI support (i18n ready)
- [ ] Video analytics dashboard
- [ ] Batch video generation
- [ ] Custom video templates
- [ ] API rate limiting and quota management
- [ ] Social media auto-publishing
- [ ] Video collaboration features

## License

MIT License - feel free to use this project for your own purposes.

## Contact

For questions or support, contact: contact@adsvideo.co
