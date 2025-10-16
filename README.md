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
     │  <─── Video URL ──   ├─ Download           │
     │                      ├─ Save to DB         │
     └─ Display Video       └─ Serve File         │
```

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

## Future Enhancements

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Advanced video editing options
- [ ] Multi-language support
- [ ] Video analytics dashboard
- [ ] Batch video generation
- [ ] Custom video templates
- [ ] API rate limiting and quota management

## License

MIT License - feel free to use this project for your own purposes.

## Contact

For questions or support, contact: contact@aivideo.diy
