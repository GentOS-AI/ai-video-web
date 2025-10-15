# Getting Started with AIVideo.DIY

## Quick Start Guide

### Prerequisites
Ensure you have the following installed:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control

### Installation

1. **Navigate to the project directory**:
```bash
cd ai-video-web
```

2. **Install dependencies** (if not already done):
```bash
npm install
```

3. **Start the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

You should see the AIVideo.DIY homepage with:
- A responsive navigation bar
- Hero section with form and video carousel
- Showcase section with video grid
- Professional footer

## Development Server

The development server will:
- ✅ Auto-reload on file changes
- ✅ Show detailed error messages
- ✅ Enable React Developer Tools
- ✅ Use Turbopack for fast builds

**Available at**:
- Local: http://localhost:3000
- Network: http://[your-ip]:3000

## Project Structure Overview

```
ai-video-web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with SEO
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   └── sitemap.ts         # SEO sitemap
│
├── components/            # React components
│   ├── Navbar.tsx         # Navigation
│   ├── HeroSection.tsx    # Main section
│   ├── ShowcaseSection.tsx# Video showcase
│   ├── Footer.tsx         # Footer
│   ├── Button.tsx         # Reusable button
│   ├── VideoPlayer.tsx    # Video player
│   └── UploadButton.tsx   # File upload
│
├── lib/                   # Utilities
│   └── utils.ts          # Helper functions
│
└── public/                # Static assets
    └── robots.txt        # SEO config
```

## Making Changes

### 1. Edit the Hero Section
Edit [app/page.tsx](app/page.tsx) or [components/HeroSection.tsx](components/HeroSection.tsx):

```tsx
// Change the heading
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
  Your Custom{" "}
  <span className="text-gradient-purple">Heading Here</span>
</h1>
```

### 2. Customize Colors
Edit [app/globals.css](app/globals.css):

```css
:root {
  --purple-500: #8b5cf6;  /* Change to your color */
  --purple-600: #7c3aed;
  /* etc... */
}
```

### 3. Add Your Logo
Replace the Sparkles icon in [components/Navbar.tsx](components/Navbar.tsx):

```tsx
import Image from "next/image";

// Replace:
<Sparkles className="w-5 h-5 text-white" />

// With:
<Image src="/logo.svg" alt="Logo" width={20} height={20} />
```

### 4. Update Site Metadata
Edit [app/layout.tsx](app/layout.tsx):

```tsx
export const metadata: Metadata = {
  title: "Your Site Title",
  description: "Your description",
  // etc...
};
```

## Adding Assets

### Videos
Place video files in `/public/videos/`:

```
public/
└── videos/
    ├── sample1.mp4
    ├── sample2.mp4
    ├── sample3.mp4
    ├── showcase1.mp4
    └── ... (up to showcase6.mp4)
```

Then update the paths in [components/HeroSection.tsx](components/HeroSection.tsx:17-28):

```tsx
const sampleVideos = [
  {
    id: 1,
    src: "/videos/sample1.mp4",  // ✅ Correct path
    poster: "/images/poster1.jpg",
    title: "Product Launch",
  },
  // ...
];
```

### Images
Place images in `/public/images/`:

```
public/
└── images/
    ├── poster1.jpg
    ├── poster2.jpg
    ├── sample1.jpg
    └── ... (sample images)
```

### Logo & Favicon
1. **Logo**: Place `logo.svg` or `logo.png` in `/public/`
2. **Favicon**: Replace `/app/favicon.ico`

## Building for Production

### 1. Build the project
```bash
npm run build
```

This will:
- Compile TypeScript
- Optimize CSS
- Bundle JavaScript
- Generate static pages
- Create production-ready output in `.next/`

### 2. Test production build locally
```bash
npm run start
```

Navigate to http://localhost:3000 to see the production version.

### 3. Check build output
```
Route (app)              Size    First Load JS
┌ ○ /                 51.8 kB      165 kB
├ ○ /_not-found          0 B      113 kB
└ ○ /sitemap.xml         0 B        0 kB
```

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional):
```bash
npm i -g vercel
```

2. **Push to GitHub**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

3. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Click "Deploy"

**That's it!** Vercel will:
- ✅ Auto-build on every push
- ✅ Provide HTTPS automatically
- ✅ Set up CDN globally
- ✅ Give you a `.vercel.app` domain

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy via Netlify Dashboard**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import existing project"
   - Select GitHub and choose your repo
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click "Deploy"

### Option 3: Custom Server (VPS/AWS/DigitalOcean)

1. **Build the project**:
```bash
npm run build
```

2. **Install PM2** (process manager):
```bash
npm install -g pm2
```

3. **Start with PM2**:
```bash
pm2 start npm --name "aivideo-diy" -- start
pm2 save
pm2 startup
```

4. **Configure Nginx** (reverse proxy):
```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

5. **Setup SSL with Let's Encrypt**:
```bash
sudo certbot --nginx -d yourdomain.com
```

## Environment Variables

Create a `.env.local` file for local development:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SORA_API_KEY=your_sora_api_key_here

# Database (when you add it)
DATABASE_URL=postgresql://user:password@localhost:5432/aivideo

# Authentication (when you add NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_secret_here

# Stripe (when you add payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Important**: Never commit `.env.local` to Git!

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Module not found errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

### Build errors
```bash
# Check for TypeScript errors
npm run build

# Run linter
npm run lint
```

### Turbopack warnings
The warning about multiple lockfiles is harmless. To silence it:

Edit `next.config.ts`:
```typescript
const config: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};
```

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run dev -- -p 3001  # Use different port

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint

# Dependencies
npm install <package>     # Add new dependency
npm install -D <package>  # Add dev dependency
npm update               # Update dependencies
```

## Next Steps

1. ✅ **Add Assets**: Place your videos and images
2. ✅ **Customize Content**: Update text, colors, and branding
3. ✅ **Test Responsiveness**: Check mobile, tablet, desktop
4. ✅ **Deploy**: Push to Vercel/Netlify
5. ⏭️ **Add Backend**: Integrate Sora 2 API
6. ⏭️ **Add Authentication**: Implement user login
7. ⏭️ **Add Payments**: Set up Stripe

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Framer Motion**: https://www.framer.com/motion/
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vercel Deployment**: https://vercel.com/docs

## Support

Need help? Check these files:
- `README.md` - Project overview
- `PROJECT_SUMMARY.md` - Detailed documentation
- `IMPLEMENTATION_CHECKLIST.md` - Feature checklist

---

**Happy coding!** 🚀
