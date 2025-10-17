import type { Metadata } from "next";
import { BookOpen, Calendar, Clock } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";

export const metadata: Metadata = {
  title: "Blog - AI Video Marketing Tips & Updates | AdsVideo",
  description:
    "Discover expert tips, insights, and the latest updates on AI video generation, marketing strategies, and content creation. Stay ahead with AdsVideo's blog.",
  keywords: [
    "AI video marketing",
    "video generation tips",
    "AI content creation",
    "Sora 2 tutorials",
    "video marketing strategies",
    "advertising tips",
  ],
  openGraph: {
    title: "AdsVideo Blog - AI Video Marketing Tips & Insights",
    description:
      "Expert guides, tips, and updates on AI-powered video generation for businesses.",
    type: "website",
  },
};

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: string;
  author: string;
}

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "10 Tips for Creating Viral Marketing Videos with AI",
    excerpt:
      "Learn the secrets to crafting engaging video content that captures attention and drives conversions. Discover proven strategies from successful campaigns.",
    date: "2025-01-15",
    category: "Marketing",
    readTime: "5 min",
    author: "Sarah Chen",
  },
  {
    id: 2,
    title: "Sora 2 vs Sora 1: Which AI Model Should You Choose?",
    excerpt:
      "A comprehensive comparison of Sora's latest AI models. Understand the key differences, performance metrics, and when to use each model for optimal results.",
    date: "2025-01-12",
    category: "Technology",
    readTime: "7 min",
    author: "Michael Torres",
  },
  {
    id: 3,
    title: "The Ultimate Guide to AI Video Generation for Small Businesses",
    excerpt:
      "Everything small business owners need to know about leveraging AI for video marketing. From strategy to execution, we cover it all.",
    date: "2025-01-10",
    category: "Business",
    readTime: "10 min",
    author: "Emma Rodriguez",
  },
  {
    id: 4,
    title: "5 Common Mistakes When Creating AI-Generated Videos",
    excerpt:
      "Avoid these pitfalls that can sabotage your video campaigns. Learn from others' mistakes and create better content from day one.",
    date: "2025-01-08",
    category: "Tips & Tricks",
    readTime: "6 min",
    author: "David Kim",
  },
  {
    id: 5,
    title: "How to Write the Perfect Video Generation Prompt",
    excerpt:
      "Master the art of prompt engineering for AI video generation. Detailed examples and best practices to get exactly what you envision.",
    date: "2025-01-05",
    category: "Tutorial",
    readTime: "8 min",
    author: "Lisa Anderson",
  },
  {
    id: 6,
    title: "AI Video Marketing ROI: What to Expect in 2025",
    excerpt:
      "Data-driven insights on the return on investment from AI video marketing. Real case studies and performance metrics from successful campaigns.",
    date: "2025-01-03",
    category: "Business",
    readTime: "9 min",
    author: "James Wilson",
  },
  {
    id: 7,
    title: "Creating Brand-Consistent Videos with AI Technology",
    excerpt:
      "Maintain your brand identity while leveraging AI. Tips for ensuring consistency in style, tone, and messaging across all your video content.",
    date: "2024-12-28",
    category: "Branding",
    readTime: "6 min",
    author: "Sofia Martinez",
  },
  {
    id: 8,
    title: "The Future of Video Marketing: AI Trends for 2025",
    excerpt:
      "Expert predictions and emerging trends in AI video generation. Stay ahead of the curve with insights into what's coming next in the industry.",
    date: "2024-12-25",
    category: "Industry News",
    readTime: "7 min",
    author: "Alex Thompson",
  },
];

const categories = [
  "All Posts",
  "Marketing",
  "Technology",
  "Business",
  "Tips & Tricks",
  "Tutorial",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <SimpleHeader
        title="Blog"
        subtitle="Tips, insights, and updates on AI video generation"
        icon={<BookOpen className="w-6 h-6 text-white" />}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                category === "All Posts"
                  ? "bg-gradient-purple text-white shadow-md"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:text-purple-600"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 cursor-pointer group"
            >
              {/* Category Badge */}
              <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-6 group-hover:from-purple-200 group-hover:to-purple-100 transition-colors">
                <span className="inline-block px-3 py-1 bg-white text-purple-700 text-xs font-semibold rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <time>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="mt-3 text-xs text-gray-500">
                  By {post.author}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Stay Updated with Our Newsletter
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest tips, insights, and updates on AI video generation
            delivered straight to your inbox. No spam, unsubscribe anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button className="w-full sm:w-auto px-6 py-3 bg-gradient-purple text-white rounded-lg hover:shadow-lg transition-all font-semibold whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy.
          </p>
        </div>

        {/* SEO Content Section */}
        <div className="mt-16 bg-white/50 rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Choose AdsVideo for AI Video Generation?
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-4">
              AdsVideo is your trusted partner for professional AI-powered video
              generation. Our platform leverages cutting-edge AI models including
              Sora 2 and Runway Gen-3 to transform your ideas into stunning
              advertising videos in minutes.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you're a small business owner, marketing professional, or
              content creator, our blog provides valuable insights, tutorials, and
              strategies to help you maximize the potential of AI video
              marketing. Stay ahead of the curve with our expert content.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
