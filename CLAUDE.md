# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIVideo.DIY is a professional AI video generation website built with Next.js 15.5.5, TypeScript, and Tailwind CSS 4. It's designed for businesses and marketers to create advertising videos using Sora 2 AI technology.

**Target Audience**: B2B customers (advertisers, marketing teams, businesses)
**Design Philosophy**: INTJ-inspired minimalist, professional, technology-forward aesthetic

## Development Commands

### Development Server
```bash
npm run dev              # Start dev server on port 3000 (uses Turbopack)
npm run dev -- -p 8080   # Start on custom port (e.g., 8080)
```

### Production Build
```bash
npm run build            # Build for production (TypeScript + ESLint checks enforced)
npm run start            # Start production server
```

### Linting
```bash
npm run lint             # Run ESLint checks
```

### Cache Management
```bash
rm -rf .next && npm run dev  # Clear Next.js cache and restart
```

## Critical Configuration

### Strict TypeScript Enforcement
This project uses **maximum TypeScript strictness** with 13 additional compiler options beyond standard strict mode:
- `noUncheckedIndexedAccess: true` - Array access returns `Type | undefined`
- `noUnusedLocals: true` - Unused variables cause build failure
- `noUnusedParameters: true` - Unused parameters cause build failure
- `noImplicitReturns: true` - All code paths must return
- See [TYPESCRIPT_CONFIG.md](TYPESCRIPT_CONFIG.md) for complete list

**Build Behavior**:
- `next.config.ts` has `ignoreBuildErrors: false` - builds WILL fail on type errors
- `next.config.ts` has `ignoreDuringBuilds: false` - builds WILL fail on ESLint errors

**Key Pattern**: When accessing arrays, always check for undefined:
```typescript
const item = array[index];
if (!item) return null; // Required due to noUncheckedIndexedAccess
// Now safe to use item
```

### External Image Configuration
Images are loaded from external CDNs via Next.js Image component. Configured in `next.config.ts`:
- `images.unsplash.com` - High-quality placeholder images
- `commondatastorage.googleapis.com` - Open-source demo videos

**To add new image sources**: Update `next.config.ts` → `images.remotePatterns`

## Architecture & Code Organization

### Asset Management Pattern
All visual assets (images, videos) are centrally configured in `/lib/assets.ts`:
```typescript
export const trialImages = [...];    // 4 trial images for Hero section
export const heroVideos = [...];     // 3 videos for Hero carousel
export const showcaseVideos = [...]; // 6 videos for Showcase section
```

**Why**: Single source of truth for all asset URLs, type-safe, easy to replace CDN or switch to local files.

**To replace assets**: Edit `/lib/assets.ts` and update URLs or switch to local paths (e.g., `/images/your-file.jpg`)

### Component Architecture

**Page Structure** (top to bottom):
1. `app/page.tsx` - Minimal, just imports and composes sections
2. `Navbar` - Fixed position, backdrop blur, responsive mobile menu
3. `HeroSection` - Two-column: left (form) + right (video carousel)
4. `ShowcaseSection` - Responsive grid (3→2→1 columns)
5. `Footer` - Three-column layout with gradient divider

**Shared Components**:
- `Button` - 3 variants (primary, secondary, outline), 3 sizes
- `VideoPlayer` - Custom player with play/pause overlay
- `UploadButton` - Drag-drop file upload with preview

**State Management**: Currently local component state only (useState). No global state manager.

### Styling System

**Theme Configuration**: `app/globals.css` defines CSS variables for the purple gradient theme:
```css
--purple-500: #8b5cf6;
--purple-600: #7c3aed;
--purple-400: #a855f7;
--purple-300: #c084fc;
```

**Custom Classes**:
- `.gradient-purple` - Background gradient
- `.text-gradient-purple` - Text gradient with background-clip

**Responsive Breakpoints**:
- Mobile: `< 640px` (sm)
- Tablet: `640px - 1024px` (md/lg)
- Desktop: `> 1024px` (lg+)

**Design Patterns**:
- Mobile-first (base styles are mobile, use `sm:`, `md:`, `lg:` for larger screens)
- Consistent spacing: 4px base unit (Tailwind default)
- Touch targets: Minimum 44x44px on mobile
- Purple gradient used sparingly for CTAs, hover states, accents

### Animation Patterns

**Framer Motion Usage**:
```typescript
// Page load animations
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}

// Scroll-triggered animations
whileInView={{ opacity: 1, y: 0 }}
viewport={{ once: true }}

// Staggered animations
transition={{ duration: 0.5, delay: index * 0.1 }}
```

**Timing Standards**:
- Standard transitions: 200-300ms
- Page load animations: 600ms
- Hover effects: Scale 1.05 or 1.1, 200ms
- Active states: Scale 0.95

## Development Patterns & Conventions

### File Upload Pattern
`UploadButton` component handles both:
1. Click to browse (file input)
2. Drag-and-drop (onDragOver/onDrop handlers)

Preview is set via FileReader API and base64 data URL.

### Video Carousel Pattern
`HeroSection` manages video carousel with:
- `currentVideoIndex` state
- `nextVideo()` / `prevVideo()` functions using modulo for wrapping
- Safe array access with null check (TypeScript requirement)

### Form Input Pattern
- Controlled components with `useState`
- Character limits with counters
- Visual feedback on focus (purple border, ring)

### Image Optimization
Always use Next.js `<Image>` component:
```typescript
<Image
  src={url}
  alt="description"
  fill              // For container-sized images
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"  // Responsive sizing hints
/>
```

## SEO Implementation

**Meta Tags**: Configured in `app/layout.tsx` with:
- Complete Open Graph (og:image uses `/og-image.svg`)
- Twitter Card metadata
- Structured keywords array

**Sitemap**: Dynamic generation in `app/sitemap.ts`
**Robots**: Static file in `public/robots.txt`

**SEO Best Practices**:
- Semantic HTML (nav, header, main, footer, section)
- Proper heading hierarchy (H1 → H2 → H3)
- Alt text on all images
- ARIA labels on interactive elements

## Common Development Workflows

### Adding a New Component
1. Create in `/components/YourComponent.tsx`
2. Use `"use client"` directive if it needs interactivity (state, events)
3. Export as named export: `export const YourComponent = () => {...}`
4. Import in parent: `import { YourComponent } from "@/components/YourComponent"`

### Modifying Colors
Edit `app/globals.css`:
- CSS variables in `:root` for theme colors
- Tailwind utility classes will automatically use updated variables
- Custom classes (`.gradient-purple`, `.text-gradient-purple`) may need manual updates

### Adding External Images
1. Add hostname to `next.config.ts` → `images.remotePatterns`
2. Restart dev server (config changes require restart)
3. Use in `<Image src="https://new-domain.com/..." />`

### TypeScript Errors During Build
**Common issues**:
1. Array access without null check → Add `if (!item) return null;`
2. Unused variables → Remove or prefix with `_` (e.g., `_unusedParam`)
3. Missing return paths → Ensure all function paths return a value

**Quick fix**: Check `TYPESCRIPT_CONFIG.md` for pattern examples

## Performance Considerations

**Bundle Size**: Currently ~165 kB first load JS
**Optimization Applied**:
- Static generation for all pages
- Code splitting (dynamic imports ready)
- Image optimization via Next.js
- Font optimization with next/font

**Video Considerations**:
- Videos use CDN (Google Cloud Storage)
- Poster images shown until play
- Auto-play with muted + loop for demos

## Future Backend Integration Notes

Current implementation is **frontend-only** with:
- Mock video URLs (open-source demos)
- No authentication (Login button is UI-only)
- No video generation API calls

**Placeholder patterns for future**:
- `handleGenerate()` in `HeroSection` - Add Sora 2 API call here
- `toggleLogin()` in `Navbar` - Replace with NextAuth.js integration
- Asset URLs in `/lib/assets.ts` - Replace with database/CMS

## Documentation Reference

- [README.md](README.md) - Project overview and quick start
- [GETTING_STARTED.md](GETTING_STARTED.md) - Detailed setup guide
- [TYPESCRIPT_CONFIG.md](TYPESCRIPT_CONFIG.md) - TypeScript strictness guide
- [DESIGN_SPEC.md](DESIGN_SPEC.md) - Complete design system specification
- [ASSETS_GUIDE.md](ASSETS_GUIDE.md) - Asset management and replacement guide
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Comprehensive technical documentation

## Deployment

**Recommended**: Vercel (one-click deployment)
**Alternative**: Netlify, custom Node.js server (PM2 + Nginx)

**Pre-deployment checklist**:
1. Run `npm run build` - must pass with 0 errors
2. Update asset URLs if using custom CDN
3. Set environment variables (when backend is added)
4. Configure custom domain
