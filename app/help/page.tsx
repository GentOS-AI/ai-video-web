import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { FAQAccordion } from "@/components/FAQAccordion";

export const metadata: Metadata = {
  title: "Help Center - AdsVideo",
  description:
    "Find answers to common questions about AdsVideo's AI video generation platform. Get help with account setup, video creation, billing, and more.",
  robots: {
    index: true,
    follow: true,
  },
};

const faqData = [
  {
    category: "Getting Started",
    items: [
      {
        id: "faq-1",
        question: "What is AdsVideo?",
        answer:
          "AdsVideo is an AI-powered platform that transforms your ideas into professional advertising videos using advanced AI models including Sora 2. Simply describe your vision, upload a reference image, and our AI generates stunning videos in minutes.",
      },
      {
        id: "faq-2",
        question: "How do I sign up?",
        answer:
          "Getting started is easy! Click the 'Login' button in the top right corner and sign in with your Google account. No credit card required for registration. Once signed in, you'll need to select a subscription plan to start generating videos.",
      },
      {
        id: "faq-3",
        question: "Do I need video editing experience?",
        answer:
          "Not at all! AdsVideo is designed for everyone, from complete beginners to professional marketers. Our AI handles all the complex video production work. You just need to describe what you want, and we'll create it for you.",
      },
    ],
  },
  {
    category: "Video Generation",
    items: [
      {
        id: "faq-4",
        question: "How long does it take to generate a video?",
        answer:
          "Most videos are generated in 1-3 minutes, depending on complexity and your subscription plan. Pro users enjoy priority processing, which is 3x faster than Basic plan processing. You'll see real-time progress updates during generation.",
      },
      {
        id: "faq-5",
        question: "What AI models are available?",
        answer:
          "We offer multiple cutting-edge AI models: Sora 2 (Latest, Pro plan only), Sora 1 (Stable, all plans), and Runway Gen-3 (Beta, Pro plan only). Each model has unique strengths, and we recommend starting with Sora 2 for the best results.",
      },
      {
        id: "faq-6",
        question: "What video quality can I expect?",
        answer:
          "Basic plan users receive HD 1080p videos, while Pro plan users get access to 4K resolution. All videos are generated at professional broadcasting quality with smooth motion and crisp visuals.",
      },
      {
        id: "faq-7",
        question: "Can I use my own images as references?",
        answer:
          "Yes! You can upload your own reference images or choose from our curated library of trial images. Reference images help the AI understand your desired style, composition, and subject matter.",
      },
    ],
  },
  {
    category: "Account & Billing",
    items: [
      {
        id: "faq-8",
        question: "What subscription plans are available?",
        answer:
          "We offer two plans: Basic ($19/month) with 100 video generations and HD quality, and Pro ($49/month) with 500 generations, 4K quality, priority processing, and access to all AI models. Both plans include a 14-day money-back guarantee.",
      },
      {
        id: "faq-9",
        question: "What are credits and how do they work?",
        answer:
          "Credits are used to generate videos. Each video generation costs 100 credits. Your credits reset monthly on your billing date. Unused credits don't roll over to the next month, so make the most of your subscription!",
      },
      {
        id: "faq-10",
        question: "Can I cancel my subscription anytime?",
        answer:
          "Absolutely! You can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your current billing period. No cancellation fees or hidden charges.",
      },
      {
        id: "faq-11",
        question: "Is there a free trial?",
        answer:
          "While we don't offer a traditional free trial, new users can try our platform risk-free with our 14-day money-back guarantee. If you're not satisfied, we'll refund your subscription in full within the first 14 days.",
      },
    ],
  },
  {
    category: "Technical Support",
    items: [
      {
        id: "faq-12",
        question: "My video generation failed. What should I do?",
        answer:
          "Don't worry! Failed generations don't deduct credits from your account. You can retry the generation with a different prompt or reference image. If the issue persists, contact our support team at support@adsvideo.co with your video ID.",
      },
      {
        id: "faq-13",
        question: "Can I download my generated videos?",
        answer:
          "Yes! All completed videos can be downloaded in high-quality MP4 format. Navigate to 'My Videos', click on any completed video, and use the download button. Pro users also get watermark-free downloads.",
      },
      {
        id: "faq-14",
        question: "How long are my videos stored?",
        answer:
          "Videos are stored securely in your account based on your subscription: Basic users get 5GB storage, Pro users get 50GB. Videos are kept indefinitely as long as your subscription is active. Download important videos for permanent offline storage.",
      },
      {
        id: "faq-15",
        question: "Do you offer API access?",
        answer:
          "Yes! API access is available for Pro plan subscribers. With our API, you can integrate AdsVideo's video generation capabilities directly into your applications. Visit our API documentation for detailed integration guides.",
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <SimpleHeader
        title="Help Center"
        subtitle="Find answers to common questions"
        icon={<HelpCircle className="w-6 h-6 text-white" />}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <div className="text-center mb-12">
          <p className="text-lg text-gray-600">
            Can't find what you're looking for?{" "}
            <a
              href="mailto:support@adsvideo.co"
              className="text-purple-600 hover:text-purple-700 font-semibold"
            >
              Contact our support team
            </a>
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqData.map((category) => (
            <div key={category.category}>
              <FAQAccordion items={category.items} category={category.category} />
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-md p-8 border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@adsvideo.co"
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hover:shadow-lg transition-all font-semibold"
            >
              Email Support
            </a>
            <a
              href="/"
              className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-all font-semibold"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
