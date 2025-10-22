import { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAllPosts, getAllCategories } from "@/lib/data/blog-posts";
import { Sparkles, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Video Generation Blog | Tips, Guides & Best Practices | AIVideo.DIY",
  description: "Learn everything about AI video generation with Sora 2. Expert tips, comprehensive guides, and best practices for creating stunning videos with artificial intelligence.",
  keywords: [
    "AI video blog",
    "Sora 2 tutorials",
    "video generation tips",
    "AI video marketing",
    "video content strategy",
    "prompt engineering",
    "AI video best practices",
  ],
  openGraph: {
    title: "AI Video Generation Blog | Expert Tips & Guides",
    description: "Master AI video generation with expert insights, tutorials, and best practices from the AIVideo.DIY team.",
    type: "website",
  },
  alternates: {
    canonical: "/blog",
  },
};

interface BlogPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const allPosts = getAllPosts();
  const categories = getAllCategories();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
        {/* Hero Section */}
      <section className="pt-32 pb-0 sm:pb-0 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI Video Generation Blog</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6">
              Learn & Master{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                AI Video Creation
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Expert insights, comprehensive guides, and proven strategies to create stunning videos with AI.
              Stay ahead with the latest tips and best practices.
            </p>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all">
              All Posts
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-full text-sm font-medium hover:border-purple-300 hover:text-purple-600 transition-all"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts Section */}
      <section className="pb-12 pt-4 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              All Articles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {allPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </>
  );
}
