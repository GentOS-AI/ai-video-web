/**
 * Blog Posts Data
 * SEO-optimized blog content for AI video generation
 */

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: number; // in minutes
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "ai-video-generation-guide-2025",
    title: "The Complete Guide to AI Video Generation in 2025",
    description: "Learn how AI is revolutionizing video creation. Discover the best practices, tools, and techniques for generating professional videos with AI in 2025.",
    content: `
# The Complete Guide to AI Video Generation in 2025

Artificial Intelligence has transformed the way we create video content. In 2025, AI video generation has become more accessible, powerful, and essential for businesses of all sizes.

## What is AI Video Generation?

AI video generation uses advanced machine learning models to create video content from text descriptions, images, or other inputs. Unlike traditional video editing, AI can generate entirely new scenes, animations, and effects automatically.

## Key Benefits of AI Video Generation

### 1. Speed and Efficiency
Traditional video production can take days or weeks. AI video generation reduces this to minutes or hours, allowing you to create content at scale.

### 2. Cost-Effective
No need for expensive equipment, studios, or large production teams. AI democratizes video creation for small businesses and individual creators.

### 3. Consistency
AI maintains consistent quality and style across all your videos, perfect for brand identity and marketing campaigns.

### 4. Accessibility
Even without technical skills, anyone can create professional-looking videos with AI tools.

## How Does AI Video Generation Work?

Modern AI video generation, powered by models like Sora 2, uses several advanced techniques:

- **Diffusion Models**: Generate high-quality visuals by gradually refining random noise into coherent images
- **Transformer Architecture**: Understand context and relationships in your text prompts
- **Temporal Coherence**: Maintain consistency across video frames for smooth motion
- **Style Transfer**: Apply artistic styles and visual effects automatically

## Best Practices for AI Video Generation

### Write Clear Prompts
The quality of your output depends heavily on your input. Be specific about:
- Scene descriptions
- Camera angles and movements
- Lighting and atmosphere
- Character actions and emotions

### Start with High-Quality Images
If you're using image-to-video generation, start with high-resolution images (at least 720p) for best results.

### Iterate and Refine
Don't expect perfection on the first try. Generate multiple versions and refine your prompts based on results.

### Optimize for Your Platform
Different platforms have different requirements:
- **Instagram/TikTok**: 9:16 portrait format
- **YouTube**: 16:9 landscape format
- **Stories**: Square or vertical formats

## Popular Use Cases

### 1. Marketing and Advertising
Create product demos, promotional videos, and ad campaigns quickly and cost-effectively.

### 2. Social Media Content
Generate engaging content for Instagram, TikTok, Facebook, and LinkedIn.

### 3. Educational Content
Produce explainer videos, tutorials, and training materials.

### 4. E-commerce
Showcase products with dynamic videos that highlight features and benefits.

### 5. Entertainment
Create short films, animations, and creative content.

## Choosing the Right AI Video Tool

When selecting an AI video generation platform, consider:

- **Model Quality**: Look for platforms using latest models like Sora 2 or Sora 2 Pro
- **Output Resolution**: HD (720p) minimum, 4K for professional use
- **Processing Speed**: How long does generation take?
- **Pricing**: Credits-based vs subscription models
- **Features**: Image enhancement, script generation, customization options
- **Support**: Documentation, tutorials, customer service

## Future of AI Video Generation

The field is evolving rapidly. Expect to see:

- **Longer Videos**: Current limits of 8-12 seconds will extend to minutes
- **Better Motion**: More realistic physics and character movements
- **Voice Integration**: Automatic voiceover and lip-sync
- **Real-time Generation**: Instant video creation as you type
- **3D Video**: Stereoscopic and volumetric video output

## Getting Started Today

Ready to create your first AI video? Here's a simple workflow:

1. **Define Your Goal**: What do you want to achieve with the video?
2. **Prepare Your Assets**: Gather images, write scripts, plan your scenes
3. **Choose Your Platform**: Select a tool that fits your needs and budget
4. **Generate and Test**: Create your first video and review results
5. **Iterate**: Refine based on feedback and results
6. **Publish**: Share your video across your channels

## Conclusion

AI video generation is not just a trend—it's the future of content creation. By understanding the technology, following best practices, and choosing the right tools, you can create professional videos that engage your audience and grow your business.

Start your AI video generation journey today and unlock unlimited creative possibilities!
    `,
    author: {
      name: "AIVideo.DIY Team",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
    },
    publishedAt: "2025-01-15",
    updatedAt: "2025-01-15",
    category: "Guide",
    tags: ["AI Video", "Tutorial", "Sora 2", "Video Marketing"],
    coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&h=630&fit=crop",
    readTime: 8,
    featured: true,
  },
  {
    slug: "sora-2-vs-traditional-video-production",
    title: "Sora 2 vs Traditional Video Production: A Cost Analysis",
    description: "Compare the costs, time, and quality of AI video generation with Sora 2 versus traditional video production methods. Discover which approach is right for your business.",
    content: `
# Sora 2 vs Traditional Video Production: A Cost Analysis

In today's fast-paced digital world, businesses face a critical decision: invest in traditional video production or embrace AI-powered solutions like Sora 2?

## The Traditional Video Production Model

### Typical Costs
- **Professional Videographer**: $500-$2,000 per day
- **Studio Rental**: $100-$500 per hour
- **Equipment**: $200-$1,000 per day (camera, lighting, audio)
- **Editing**: $50-$150 per hour (10-20 hours typical)
- **Actors/Models**: $100-$500 per person per day
- **Total**: $2,000-$10,000+ per video

### Timeline
- Pre-production planning: 1-2 weeks
- Filming: 1-3 days
- Post-production editing: 1-2 weeks
- **Total**: 3-5 weeks per video

## The Sora 2 AI Video Generation Model

### Typical Costs
- **AIVideo.DIY Pro Plan**: $129.99/year (12,000 credits)
- **Cost per video**: ~100-300 credits ($1-$3 equivalent)
- **Total**: $1-$3 per video with subscription

### Timeline
- Concept to final video: 5-15 minutes
- **Total**: Minutes instead of weeks

## Detailed Comparison

### Quality

**Traditional Production**
- ✅ Photorealistic human actors
- ✅ Complete creative control
- ✅ Perfect for complex narratives
- ❌ Expensive to iterate
- ❌ Location and weather dependent

**Sora 2 AI**
- ✅ Consistent high-quality output
- ✅ Unlimited iterations
- ✅ Weather/location independent
- ✅ Fast style changes
- ⚠️ Best for short-form content (currently 8-12 seconds)

### Flexibility

**Traditional Production**
- Making changes after filming is expensive or impossible
- Requires reshooting with all associated costs
- Long turnaround time for revisions

**Sora 2 AI**
- Instant revisions by changing prompts
- Try multiple versions at minimal cost
- Real-time feedback and iteration

### Scalability

**Traditional Production**
- Linear cost increase with volume
- Limited by physical resources
- Hiring constraints

**Sora 2 AI**
- Marginal cost decrease with volume
- Unlimited parallel generation
- No physical constraints

## Use Case Analysis

### When to Choose Traditional Production

1. **Long-form content** (>1 minute currently)
2. **Celebrity endorsements** (real people required)
3. **Complex dialogue** scenes
4. **Legal/compliance** videos (may require real presenters)
5. **High-budget brand campaigns** (when photorealism is critical)

### When to Choose Sora 2 AI

1. **Social media content** (short, engaging clips)
2. **Product demonstrations** (highlight features quickly)
3. **Marketing campaigns** (need multiple variations)
4. **E-commerce** (product videos at scale)
5. **Rapid prototyping** (test concepts before full production)
6. **Budget constraints** (maximize output with limited resources)

## ROI Analysis

### Example: E-commerce Product Videos

**Scenario**: 100 product videos needed

**Traditional Production**
- Cost: $200,000+ (bulk discount assumed)
- Time: 6-12 months
- Revisions: Very expensive
- **ROI Timeline**: 12-18 months

**Sora 2 AI**
- Cost: $300-400 (with Pro subscription)
- Time: 1-2 weeks
- Revisions: Included
- **ROI Timeline**: 1-3 months

### Example: Social Media Campaign

**Scenario**: Weekly content for 1 year (52 videos)

**Traditional Production**
- Cost: $100,000+
- Time: Ongoing resource drain
- Consistency: Variable
- **Total Cost per Video**: ~$2,000

**Sora 2 AI**
- Cost: $130-300 annual subscription
- Time: 1-2 hours per week
- Consistency: Perfect
- **Total Cost per Video**: ~$2.50-$6

## Hybrid Approach: Best of Both Worlds

Many businesses are adopting a hybrid strategy:

1. **Use AI for**:
   - Social media content
   - Product demonstrations
   - Concept testing
   - High-volume needs

2. **Use Traditional for**:
   - Brand hero videos
   - Long-form content
   - Celebrity partnerships
   - High-stakes campaigns

## Future Outlook

As AI video technology improves:
- **Longer videos** (minutes instead of seconds)
- **Better realism** (indistinguishable from traditional)
- **Voice integration** (automatic dubbing and lip-sync)
- **Real-time generation** (instant video creation)

The cost advantage of AI will only increase, while quality gaps continue to narrow.

## Conclusion

For most businesses, Sora 2 offers:
- **99% cost reduction** compared to traditional production
- **95% time savings** from concept to delivery
- **Unlimited iteration** without additional costs
- **Perfect consistency** across all videos

Traditional production still has its place for specific use cases, but AI video generation is rapidly becoming the default choice for smart businesses looking to maximize ROI.

**The question isn't whether to use AI—it's how quickly you can integrate it into your workflow.**
    `,
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    },
    publishedAt: "2025-01-12",
    updatedAt: "2025-01-12",
    category: "Analysis",
    tags: ["Sora 2", "Cost Analysis", "ROI", "Business"],
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    readTime: 6,
    featured: true,
  },
  {
    slug: "best-practices-video-prompts",
    title: "10 Best Practices for Writing AI Video Prompts",
    description: "Master the art of prompt engineering for AI video generation. Learn proven techniques to create better prompts and get stunning results every time.",
    content: `
# 10 Best Practices for Writing AI Video Prompts

Writing effective prompts is the key to generating amazing AI videos. Here are 10 proven best practices to help you create stunning results.

## 1. Be Specific and Detailed

**Bad Prompt**: "A car driving"

**Good Prompt**: "A sleek red sports car driving along a coastal highway at sunset, with waves crashing against rocky cliffs in the background, cinematic lighting, 4K quality"

**Why It Works**: Specific details give the AI clear direction about every aspect of the scene.

## 2. Include Camera Movement

**Examples**:
- "Camera pans left to reveal..."
- "Slow zoom in on..."
- "Aerial drone shot descending towards..."
- "Tracking shot following..."
- "Static wide shot of..."

Camera directions help create dynamic, professional-looking videos.

## 3. Describe Lighting and Atmosphere

**Lighting Terms**:
- Golden hour / Magic hour
- Dramatic side lighting
- Soft diffused light
- Neon lighting
- Backlit / Rim lighting
- High contrast / Low contrast

**Atmosphere Terms**:
- Foggy / Misty
- Bright and sunny
- Moody and dark
- Dreamy / Ethereal
- Vibrant / Saturated

## 4. Specify Visual Style

**Style References**:
- "Cinematic film style"
- "Documentary photography"
- "High fashion editorial"
- "Vintage film grain"
- "Modern minimalist"
- "Cyberpunk aesthetic"

## 5. Use Action Verbs

**Strong Action Verbs**:
- Running, jumping, dancing
- Spinning, floating, soaring
- Exploding, shattering, morphing
- Blooming, growing, transforming

Action creates engaging, dynamic videos.

## 6. Set the Context and Environment

**Environment Details**:
- Time of day (dawn, noon, dusk, night)
- Weather conditions (sunny, rainy, snowy)
- Location type (urban, rural, underwater, space)
- Season (spring blossoms, autumn leaves)

## 7. Consider Composition

**Composition Terms**:
- "Centered composition"
- "Rule of thirds"
- "Symmetrical framing"
- "Leading lines"
- "Negative space"
- "Foreground interest"

## 8. Add Emotional Tone

**Emotional Descriptors**:
- Peaceful and calm
- Energetic and exciting
- Mysterious and suspenseful
- Joyful and celebratory
- Melancholic and somber

## 9. Reference Color Palettes

**Color Schemes**:
- "Warm orange and gold tones"
- "Cool blue and cyan palette"
- "Pastel pink and lavender"
- "High contrast black and white"
- "Vibrant neon colors"
- "Earthy greens and browns"

## 10. Structure Your Prompt Logically

**Recommended Structure**:
1. **Subject**: What/who is the main focus?
2. **Action**: What is happening?
3. **Environment**: Where is this taking place?
4. **Camera**: How is it being filmed?
5. **Style**: What is the visual aesthetic?
6. **Mood**: What feeling should it evoke?

### Example Using All Best Practices

"A professional chef expertly tossing vegetables in a flaming wok, sparks and steam rising, shot in a modern industrial kitchen with stainless steel surfaces, slow-motion camera capturing every detail, dramatic side lighting creating strong shadows, cinematic food photography style, warm amber and orange tones, energetic and dynamic atmosphere"

## Bonus Tips

### Do's
✅ Experiment with different phrasings
✅ Save successful prompts for reuse
✅ Iterate based on results
✅ Study example videos and their prompts
✅ Be creative and try unexpected combinations

### Don'ts
❌ Use vague or generic descriptions
❌ Overload with contradictory elements
❌ Forget to specify aspect ratio when needed
❌ Ignore the importance of lighting
❌ Give up after one try

## Practice Exercises

Try rewriting these basic prompts using our best practices:

1. "A dog playing" → ?
2. "A city at night" → ?
3. "People dancing" → ?

**Example Answers**:

1. "A golden retriever joyfully catching a red frisbee in mid-air, sunny park with green grass and trees, slow-motion shot showing fur details and water droplets, bright natural lighting, cheerful and playful mood"

2. "Aerial drone shot slowly descending into a vibrant cyberpunk city at night, neon signs reflecting on wet streets, flying cars in the distance, purple and blue color palette, dramatic fog creating depth, futuristic cinematic style"

3. "Group of diverse dancers performing synchronized hip-hop choreography on an urban rooftop at sunset, golden hour lighting, tracking camera following the movement, energetic and dynamic atmosphere, high contrast and saturated colors"

## Conclusion

Mastering prompt writing is a skill that improves with practice. Use these 10 best practices as your foundation, experiment creatively, and analyze your results to continuously refine your technique.

The better your prompts, the better your videos. Start applying these techniques today!
    `,
    author: {
      name: "Marcus Rodriguez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    },
    publishedAt: "2025-01-10",
    updatedAt: "2025-01-10",
    category: "Tutorial",
    tags: ["Prompt Engineering", "Best Practices", "Tutorial", "AI Video"],
    coverImage: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&h=630&fit=crop",
    readTime: 7,
    featured: false,
  },
  {
    slug: "ai-video-marketing-strategy-2025",
    title: "How to Build a Winning AI Video Marketing Strategy in 2025",
    description: "Create a comprehensive AI video marketing strategy that drives results. Learn audience targeting, content planning, distribution tactics, and performance metrics.",
    content: `
# How to Build a Winning AI Video Marketing Strategy in 2025

AI video generation has democratized video marketing, but success still requires a solid strategy. Here's how to build one that drives real results.

## Step 1: Define Your Goals

### Common Video Marketing Objectives
- **Brand Awareness**: Reach new audiences
- **Engagement**: Build community and loyalty
- **Lead Generation**: Capture prospect information
- **Conversions**: Drive sales directly
- **Education**: Inform customers about products
- **Support**: Reduce support tickets with tutorials

**Action**: Choose 2-3 primary goals for your video marketing efforts.

## Step 2: Know Your Audience

### Audience Research Questions
- What platforms do they use?
- What content do they engage with?
- What problems are they trying to solve?
- What video length do they prefer?
- What time of day are they most active?

### Create Audience Personas
For each target segment, define:
- Demographics (age, location, job title)
- Psychographics (interests, values, pain points)
- Behavioral patterns (when/how they consume video)
- Content preferences (style, length, format)

## Step 3: Content Planning Framework

### The 60-30-10 Rule
- **60% Educational**: Solve problems, provide value
- **30% Inspirational**: Tell stories, showcase results
- **10% Promotional**: Sell products directly

### Content Pillars

**1. Product Videos**
- Demonstrations
- Features and benefits
- Comparison videos
- Unboxing experiences

**2. Educational Content**
- How-to tutorials
- Industry insights
- Tips and tricks
- Expert interviews

**3. Social Proof**
- Customer testimonials
- Case studies
- Success stories
- Behind-the-scenes

**4. Trending Content**
- Seasonal campaigns
- Industry news reactions
- Viral challenges
- Current events

## Step 4: Production Workflow with AI

### Batch Creation Process

**Week 1: Planning**
- Research trends and topics
- Write scripts for 10-20 videos
- Gather or create images
- Plan publication schedule

**Week 2: Generation**
- Generate all videos in batch
- Review and select best versions
- Create variations for A/B testing
- Organize files and assets

**Week 3: Optimization**
- Add captions and text overlays
- Create thumbnails
- Write descriptions and tags
- Schedule posts

**Week 4: Analysis & Iteration**
- Review performance metrics
- Identify top performers
- Adjust strategy based on data
- Plan next month's content

### Content Calendar Template

| Week | Mon | Tue | Wed | Thu | Fri |
|------|-----|-----|-----|-----|-----|
| 1 | Product Demo | Tutorial | Testimonial | Trending Topic | Weekend Tip |
| 2 | Feature Highlight | How-to | Case Study | Industry News | Fun/Engaging |
| 3 | Behind-Scenes | Educational | Social Proof | Product Use Case | Inspirational |
| 4 | Customer Story | Expert Tips | Comparison | Trend Reaction | Weekly Recap |

## Step 5: Platform-Specific Strategies

### Instagram
- **Format**: 9:16 vertical, 15-60 seconds
- **Style**: Visually striking, fast-paced
- **Captions**: Short, emoji-rich
- **Posting**: 3-5 times per week
- **Best Time**: 11am-1pm, 7pm-9pm

### TikTok
- **Format**: 9:16 vertical, 15-60 seconds
- **Style**: Authentic, trend-driven
- **Audio**: Trending sounds important
- **Posting**: Daily if possible
- **Best Time**: 6am-10am, 7pm-11pm

### YouTube
- **Format**: 16:9 landscape, any length
- **Style**: Polished, informative
- **SEO**: Critical for discovery
- **Posting**: 2-4 times per week
- **Best Time**: 2pm-4pm weekdays

### LinkedIn
- **Format**: 16:9 or square, 30-90 seconds
- **Style**: Professional, value-driven
- **Captions**: Longer, detailed
- **Posting**: 2-3 times per week
- **Best Time**: 8am-10am, 12pm, 5pm-6pm

### Facebook
- **Format**: Square or 16:9, 30-120 seconds
- **Style**: Engaging, shareable
- **Captions**: Medium length with CTA
- **Posting**: 3-5 times per week
- **Best Time**: 1pm-3pm

## Step 6: Optimization Techniques

### Video SEO

**YouTube Optimization**
- Keyword-rich titles (5-7 words)
- Detailed descriptions (200+ words)
- Relevant tags (10-15 tags)
- Custom thumbnails (1280x720px)
- Chapters and timestamps
- Engaging intro (hook in first 3 seconds)

**Social Media Optimization**
- Native uploads (don't share links)
- Square or vertical format
- Captions ON (80% watch without sound)
- Strong opening frame (grabs attention)
- Clear CTA (tell viewers what to do)

### A/B Testing

**Test These Variables**:
- Thumbnail styles
- Video lengths
- Opening hooks
- CTA placements
- Music choices
- Color schemes
- Text overlays

## Step 7: Performance Metrics

### Key Metrics to Track

**Awareness Metrics**
- Views / Impressions
- Reach
- View-through rate
- Share rate

**Engagement Metrics**
- Watch time / Retention rate
- Likes, comments, saves
- Click-through rate
- Engagement rate

**Conversion Metrics**
- Lead form submissions
- Website clicks
- Purchase conversions
- Cost per acquisition

### Analytics Tools
- Platform native analytics (Instagram Insights, YouTube Analytics)
- Google Analytics (track website traffic from videos)
- Social media management tools (Hootsuite, Buffer)
- Heatmap tools (see where viewers drop off)

## Step 8: Scaling Your Strategy

### Month 1-2: Foundation
- Establish posting rhythm
- Test different content types
- Build audience base
- Learn what works

### Month 3-4: Optimization
- Double down on top performers
- Refine production process
- Increase posting frequency
- Expand to new platforms

### Month 5-6: Scale
- Batch create content
- Repurpose successful videos
- Invest in promotion (ads)
- Build content systems

### Month 6+: Systematize
- Create playbooks for each content type
- Develop brand style guide
- Train team members
- Automate where possible

## Common Pitfalls to Avoid

❌ **Inconsistent posting** - Choose a sustainable frequency
❌ **Ignoring analytics** - Data drives improvement
❌ **Too much selling** - Focus on value first
❌ **Wrong aspect ratios** - Match platform requirements
❌ **No clear CTA** - Tell viewers what to do next
❌ **Forgetting captions** - Most watch without sound
❌ **One-size-fits-all** - Customize for each platform

## Success Story Example

**Company**: Boutique fashion brand
**Goal**: Increase online sales

**Strategy**:
- 3 product videos per week (Instagram + TikTok)
- 1 styling tutorial per week (YouTube)
- Behind-the-scenes content (Stories)

**Tools**:
- AIVideo.DIY for all video generation
- Canva for thumbnails and text overlays
- Buffer for scheduling

**Results** (6 months):
- 450% increase in Instagram engagement
- 300% more website traffic from social
- 180% increase in online sales
- $25,000 additional revenue
- ROI: 8,300% (cost: $300, return: $25,000)

## Conclusion

A winning AI video marketing strategy combines:
1. Clear goals and audience understanding
2. Consistent content production
3. Platform-specific optimization
4. Data-driven iteration
5. Sustainable workflows

With AI tools like Sora 2, you can execute this strategy at a fraction of traditional costs while achieving professional results.

**Start today**: Choose one platform, commit to a posting schedule, and create your first batch of videos. Success comes from consistent action!
    `,
    author: {
      name: "Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    },
    publishedAt: "2025-01-08",
    updatedAt: "2025-01-08",
    category: "Marketing",
    tags: ["Marketing Strategy", "Social Media", "Content Planning", "Business Growth"],
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop",
    readTime: 10,
    featured: false,
  },
];

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
  return blogPosts.sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get featured blog posts
 */
export function getFeaturedPosts(): BlogPost[] {
  return blogPosts
    .filter(post => post.featured)
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Get blog post by slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

/**
 * Get related posts (same category or tags)
 */
export function getRelatedPosts(slug: string, limit: number = 3): BlogPost[] {
  const currentPost = getPostBySlug(slug);
  if (!currentPost) return [];

  return blogPosts
    .filter(post => post.slug !== slug)
    .filter(post =>
      post.category === currentPost.category ||
      post.tags.some(tag => currentPost.tags.includes(tag))
    )
    .slice(0, limit);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts
    .filter(post => post.category === category)
    .sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(blogPosts.map(post => post.category)));
}

/**
 * Get all tags
 */
export function getAllTags(): string[] {
  const allTags = blogPosts.flatMap(post => post.tags);
  return Array.from(new Set(allTags));
}
