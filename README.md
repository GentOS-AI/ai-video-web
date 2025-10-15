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

## Future Enhancements

- [ ] Connect to actual Sora 2 API
- [ ] User authentication system
- [ ] Video rendering progress tracking
- [ ] Payment integration
- [ ] User dashboard
- [ ] Video history and management
- [ ] Advanced editing options

## License

MIT License - feel free to use this project for your own purposes.

## Contact

For questions or support, contact: contact@aivideo.diy
