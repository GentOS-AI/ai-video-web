import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - AI Video Marketing Tips & Updates | Video4Ads",
  description:
    "Discover expert tips, insights, and the latest updates on AI video generation, marketing strategies, and content creation. Stay ahead with Video4Ads's blog.",
  keywords: [
    "AI video marketing",
    "video generation tips",
    "AI content creation",
    "Sora 2 tutorials",
    "video marketing strategies",
    "advertising tips",
  ],
  openGraph: {
    title: "Video4Ads Blog - AI Video Marketing Tips & Insights",
    description:
      "Expert guides, tips, and updates on AI-powered video generation for businesses.",
    type: "website",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
