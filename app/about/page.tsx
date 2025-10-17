import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Sparkles, Target, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us - AdsVideo",
  description:
    "Learn about AdsVideo's mission to democratize professional video creation with AI-powered technology. Discover our story, values, and team.",
  openGraph: {
    title: "About AdsVideo - AI Video Generation Platform",
    description:
      "Transforming ideas into professional advertising videos with cutting-edge AI technology.",
  },
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
        {/* Hero Section */}
        <section className="pt-32 sm:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-gradient-purple-pink">Ads</span><span className="text-purple-500">Video</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              We're on a mission to democratize professional video creation,
              empowering businesses and creators with cutting-edge AI
              technology.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-md">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Our Mission
                  </h2>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At AdsVideo, we believe that every business deserves access to
                  professional-quality video content. Traditional video
                  production is expensive, time-consuming, and requires
                  specialized skills.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We're changing that by harnessing the power of AI to make
                  video creation as simple as describing your vision. Our
                  platform transforms your ideas into stunning advertising
                  videos in minutes, not weeks.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Innovation First
                      </h3>
                      <p className="text-sm text-gray-600">
                        Leveraging the latest AI models including Sora 2 for
                        cutting-edge results.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Speed & Quality
                      </h3>
                      <p className="text-sm text-gray-600">
                        Professional-grade videos in minutes, maintaining
                        broadcast quality.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        User-Centric
                      </h3>
                      <p className="text-sm text-gray-600">
                        Designed for marketers, not technologists. No video
                        editing skills required.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do, from product
                development to customer support.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl bg-white shadow-md border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Accessibility
                </h3>
                <p className="text-gray-600">
                  Making professional video creation accessible to everyone,
                  regardless of budget or technical expertise.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-white shadow-md border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Excellence
                </h3>
                <p className="text-gray-600">
                  Delivering the highest quality AI-generated videos that meet
                  professional broadcasting standards.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl bg-white shadow-md border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Transparency
                </h3>
                <p className="text-gray-600">
                  Clear pricing, honest communication, and transparent AI
                  processes you can trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-purple-500 rounded-2xl p-8 sm:p-12 text-white shadow-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                  Trusted by Thousands
                </h2>
                <p className="text-white/90">
                  Join the growing community of businesses creating amazing
                  videos with AI
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">7,635+</div>
                  <div className="text-white/90 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">50K+</div>
                  <div className="text-white/90 text-sm">Videos Created</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">4.9/5</div>
                  <div className="text-white/90 text-sm">User Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-white/90 text-sm">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of businesses creating professional videos with AI
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hover:shadow-xl transition-all font-semibold text-lg"
            >
              Start Creating Videos
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
