# Design Specification - AIVideo.DIY

## Visual Design Overview

### Design Philosophy
**Minimalist • Professional • Technology-Forward**

Crafted with an INTJ approach: systematic, efficient, and purposeful. Every element serves a function.

---

## Color System

### Primary Palette
```
Purple Gradient:
├─ #8B5CF6 (purple-500)  ───┐
├─ #A855F7 (purple-400)     ├─ Main gradient
└─ #C084FC (purple-300)  ───┘

Neutrals:
├─ #FFFFFF (white)          Background
├─ #1A1A1A (near-black)     Primary text
├─ #4B5563 (gray-600)       Secondary text
└─ #9CA3AF (gray-400)       Muted text

Accents:
├─ #F5F3FF (purple-50)      Light backgrounds
└─ #7C3AED (purple-600)     Hover states
```

### Color Usage Map
- **CTAs**: Purple gradient (#8B5CF6 → #A855F7 → #C084FC)
- **Headings**: Text gradient or solid dark (#1A1A1A)
- **Body text**: Dark gray (#4B5563)
- **Borders**: Light gray on hover → Purple
- **Backgrounds**: White with subtle purple accents
- **Shadows**: Purple tint (shadow-primary/25)

---

## Typography

### Font Stack
```
Primary: Geist Sans (Variable font)
├─ Weights: 400 (Regular), 600 (Semibold), 700 (Bold)
└─ Fallback: system-ui, -apple-system, sans-serif

Monospace: Geist Mono
└─ Used for: Code snippets (future feature)
```

### Type Scale
```
Display (H1):
├─ Mobile:  text-4xl (36px)
├─ Tablet:  text-5xl (48px)
└─ Desktop: text-6xl (60px)
   Weight: Bold (700)
   Line Height: 1.1

Heading (H2):
├─ Mobile:  text-3xl (30px)
├─ Tablet:  text-4xl (36px)
└─ Desktop: text-5xl (48px)
   Weight: Bold (700)

Subheading (H3):
├─ Size: text-lg to text-xl (18-20px)
   Weight: Semibold (600)

Body:
├─ Size: text-base to text-lg (16-18px)
   Weight: Regular (400)
   Line Height: 1.6

Small:
└─ Size: text-sm (14px)
   Weight: Medium (500)
```

---

## Spacing System

### Base Unit: 4px (Tailwind default)

```
Micro Spacing:
├─ 1  = 4px   (gap between related items)
├─ 2  = 8px   (compact spacing)
├─ 3  = 12px  (default gap)
└─ 4  = 16px  (comfortable spacing)

Component Spacing:
├─ 6  = 24px  (section padding mobile)
├─ 8  = 32px  (section padding tablet)
├─ 12 = 48px  (section padding desktop)
└─ 16 = 64px  (major section gaps)

Layout Spacing:
├─ 20 = 80px  (section vertical rhythm)
└─ 24 = 96px  (hero section padding)
```

### Spacing Patterns
- **Mobile**: Tighter (16-24px padding)
- **Tablet**: Moderate (24-32px padding)
- **Desktop**: Generous (32-64px padding)

---

## Components Design Specs

### 1. Navbar (Fixed Header)

```
Dimensions:
├─ Height: 64px (h-16)
├─ Width: 100% (full-width)
└─ Max Width: 1280px (max-w-7xl)

Styling:
├─ Background: White with 80% opacity + backdrop blur
├─ Border: Bottom 1px solid gray-200
├─ Shadow: Subtle on scroll
└─ Z-index: 50 (above all content)

Logo Section (Left):
├─ Icon: 32x32px purple gradient square
├─ Text: "AIVideo.DIY" - text-xl bold
└─ Gap: 8px (space-x-2)

Navigation (Right):
├─ "Pricing" link: text-sm font-medium
├─ Login button: Primary variant, size sm
└─ Avatar: 40x40px rounded-full (logged in)

Mobile Menu:
├─ Trigger: Hamburger icon (24x24px)
├─ Animation: Slide down with fade
└─ Items: Stack vertically with 12px gap
```

### 2. Hero Section

```
Layout:
├─ Container: max-w-7xl mx-auto
├─ Grid: 2 columns (lg:grid-cols-2)
└─ Gap: 48px (gap-12)

Left Column (Form):
Heading:
├─ Size: text-4xl to text-6xl
├─ Weight: Bold
└─ Gradient text on "AI Videos"

Prompt Input:
├─ Rows: 4
├─ Border: 2px solid gray-300
├─ Focus: 2px solid purple-500 + ring
├─ Padding: 16px (px-4 py-3)
└─ Character counter: Bottom right, text-xs

Trial Images Grid:
├─ Grid: 4 columns
├─ Gap: 12px
├─ Image: Square (aspect-square)
├─ Selected: 2px purple border + ring
└─ Hover: Scale 1.05

Upload Area:
├─ Height: 128px
├─ Border: 2px dashed gray-300
├─ Hover: Purple border
└─ Drag: Purple background

Sora Badge:
├─ Background: purple-50
├─ Border: 1px purple-200
├─ Padding: 8px 16px
└─ Icon: Sparkles (20x20px)

Generate Button:
├─ Size: Large (px-8 py-4)
├─ Background: Purple gradient
├─ Text: "Generate AI Video"
└─ Shadow: Purple tinted

Right Column (Videos):
├─ Aspect ratio: 16:9
├─ Border radius: 16px (rounded-2xl)
├─ Shadow: 2xl (large)
└─ Controls: Arrows + dots

Video Navigation:
├─ Arrows: 48x48px circles, white bg
├─ Position: Absolute, centered vertically
├─ Hover: Scale 1.1
└─ Icons: 24x24px

Indicators:
├─ Size: 8x8px (active) / 8x32px (inactive)
├─ Color: White with 50% opacity
├─ Active: Full white, expanded
└─ Position: Bottom center
```

### 3. Showcase Section

```
Container:
├─ Max width: 1280px (max-w-7xl)
├─ Padding: 80px vertical (py-20)
└─ Background: White → Purple gradient (subtle)

Header:
├─ Text align: Center
├─ Margin bottom: 64px (mb-16)
├─ H2: text-3xl to text-5xl bold
└─ Gradient on "Video Showcase"

Grid:
├─ Columns: 3 (lg) / 2 (md) / 1 (sm)
├─ Gap: 32px (gap-8)
└─ Cards: 6 total

Card Structure:
├─ Background: White
├─ Border radius: 12px (rounded-xl)
├─ Shadow: lg → 2xl on hover
├─ Transition: 300ms
└─ Hover: Translate -8px Y

Video Area:
├─ Aspect ratio: 16:9
├─ Background: Purple gradient (placeholder)
└─ Play icon: 64x64px, 40% opacity

Category Badge:
├─ Position: Top left, absolute
├─ Background: White 90% + blur
├─ Padding: 4px 12px
├─ Text: text-xs semibold purple
└─ Border radius: Full

Content Area:
├─ Padding: 24px (p-6)
├─ Title: text-lg bold
├─ Description: text-sm secondary
└─ Gap: 8px

Hover Effects:
├─ Purple gradient overlay (bottom to top)
├─ Border: 2px purple
├─ Card scale: Slight lift (-8px Y)
└─ Title color: Purple
```

### 4. Footer

```
Structure:
├─ Border top: 1px gray-200
├─ Padding: 48px vertical (py-12)
└─ Background: White

Divider:
├─ Height: 4px (h-1)
├─ Width: 100%
├─ Background: Purple gradient
├─ Border radius: Full
└─ Margin bottom: 48px

Grid:
├─ Columns: 3 (lg) / 2 (md) / 1 (sm)
└─ Gap: 32px (gap-8)

Column 1 (Company):
├─ Logo + name (same as navbar)
└─ Description: text-sm secondary

Column 2 (Links):
├─ Heading: text-sm uppercase semibold
├─ Links: text-sm secondary
└─ Hover: Purple color

Column 3 (Social):
├─ Icons: 40x40px total
├─ Icon size: 20x20px
├─ Background: Gray-100
├─ Hover: Purple bg + white text
└─ Transition: Scale 1.1

Copyright:
├─ Margin top: 48px
├─ Padding top: 32px
├─ Border top: 1px gray-200
└─ Text: Center, small, muted
```

---

## Responsive Breakpoints

### Mobile (< 640px)
```
Layout:
├─ Single column (stacked)
├─ Padding: 16px (px-4)
└─ Font size: -1 step smaller

Navbar:
├─ Hamburger menu
├─ Full width buttons
└─ Menu slides down

Hero:
├─ Video below form
├─ Full width elements
└─ Larger tap targets (48px min)

Showcase:
└─ 1 column grid
```

### Tablet (640px - 1024px)
```
Layout:
├─ Padding: 24px (px-6)
└─ Font size: Standard

Hero:
├─ Starting to stack side-by-side
└─ 2 column grid

Showcase:
└─ 2 column grid
```

### Desktop (> 1024px)
```
Layout:
├─ Max width: 1280px
├─ Padding: 32px (px-8)
└─ Font size: Full scale

Hero:
├─ Full 2 column layout
└─ Proper proportions (40/60)

Showcase:
└─ 3 column grid
```

---

## Animation Specifications

### Timing Functions
```
Standard:      200-300ms ease-in-out
Micro:         150ms ease-out
Entrance:      600ms ease-out
Scroll:        0.5s ease-out
```

### Common Animations

**Fade In**:
```tsx
initial={{ opacity: 0, y: 30 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

**Stagger**:
```tsx
transition={{ duration: 0.5, delay: index * 0.1 }}
```

**Hover Scale**:
```css
hover:scale-105
transition-transform duration-200
```

**Active State**:
```css
active:scale-95
```

---

## Accessibility

### Contrast Ratios
- **Text on white**: ≥ 4.5:1 (AA compliant)
- **Purple on white**: 4.7:1 ✅
- **Dark text on white**: 16:1 ✅

### Touch Targets
- **Minimum size**: 44x44px
- **Spacing**: 8px between targets
- **Buttons**: 48px height on mobile

### Focus States
- **All interactive**: 2px purple ring
- **Offset**: 2px
- **Visible**: On keyboard navigation
- **Skip to content**: Hidden, shows on focus

---

## Design Tokens (CSS Variables)

```css
/* Colors */
--color-primary: #8b5cf6;
--color-primary-hover: #7c3aed;
--color-accent: #c084fc;
--color-background: #ffffff;
--color-text-primary: #1a1a1a;
--color-text-secondary: #4b5563;
--color-text-muted: #9ca3af;

/* Spacing */
--spacing-xs: 0.5rem;    /* 8px */
--spacing-sm: 1rem;      /* 16px */
--spacing-md: 1.5rem;    /* 24px */
--spacing-lg: 2rem;      /* 32px */
--spacing-xl: 3rem;      /* 48px */

/* Typography */
--font-sans: 'Geist Sans', system-ui, sans-serif;
--font-mono: 'Geist Mono', monospace;

/* Effects */
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-lg: 0 10px 15px rgba(139,92,246,0.1);
--blur: blur(12px);
```

---

## Implementation Notes

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Lighthouse Score**: > 90

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Asset Optimization
- Images: WebP format, lazy loaded
- Videos: MP4 (H.264), < 5MB each
- Fonts: Variable fonts, subset
- Icons: SVG, inline when < 1KB

---

**Design System Version**: 1.0.0
**Last Updated**: 2025-10-15
**Designer**: INTJ Visual Designer
