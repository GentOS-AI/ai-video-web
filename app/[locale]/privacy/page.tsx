import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy - AdsVideo",
  description:
    "Learn how AdsVideo collects, uses, and protects your personal information. Read our Privacy Policy for complete details.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <SimpleHeader
        title="Privacy Policy"
        subtitle={`Last updated: ${lastUpdated}`}
        icon={<Shield className="w-6 h-6 text-white" />}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8 lg:p-12 border border-gray-200">
          <div className="prose prose-gray max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At AdsVideo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered video generation platform.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our Service, you consent to the data practices described in this policy. If you do not agree with this policy, please do not access or use our Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                2.1 Personal Information
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                When you register for an account, we collect:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Name and email address (via Google OAuth)</li>
                <li>Profile picture (if provided through Google)</li>
                <li>Payment information (processed securely by our payment providers)</li>
                <li>Account preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                2.2 Content and Usage Data
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Video generation prompts and reference images you upload</li>
                <li>Generated videos and associated metadata</li>
                <li>Usage statistics (video generations, credits used, features accessed)</li>
                <li>Device information and browser type</li>
                <li>IP address and approximate location</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                2.3 Cookies and Tracking Technologies
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. You can control cookie preferences through your browser settings.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the collected information for various purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>To provide and maintain our Service</li>
                <li>To process your video generation requests using AI models</li>
                <li>To manage your account and subscription</li>
                <li>To process payments and prevent fraud</li>
                <li>To send service-related notifications and updates</li>
                <li>To improve our Service and develop new features</li>
                <li>To provide customer support</li>
                <li>To analyze usage patterns and optimize performance</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                4.1 Service Providers
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We share data with third-party service providers who perform services on our behalf:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Cloud storage providers (for video and image storage)</li>
                <li>Payment processors (Stripe, PayPal)</li>
                <li>AI model providers (OpenAI, Runway)</li>
                <li>Analytics services (to understand usage patterns)</li>
                <li>Email service providers (for notifications)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                4.2 Legal Requirements
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We may disclose your information if required by law, court order, or to protect our rights, property, or safety, or that of our users or the public.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Encryption of data at rest in secure cloud storage</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure payment processing (PCI DSS compliant)</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide our Service to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                When you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </section>

            {/* Your Privacy Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@adsvideo.co" className="text-purple-600 hover:text-purple-700">
                  privacy@adsvideo.co
                </a>
              </p>
            </section>

            {/* Cookie Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Cookie Policy
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the following types of cookies:
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                8.1 Essential Cookies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Required for the Service to function properly (authentication, security, preferences).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                8.2 Analytics Cookies
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Help us understand how visitors use our Service (Google Analytics).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                8.3 Preference Cookies
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Remember your settings and preferences for a better experience.
              </p>

              <p className="text-gray-600 leading-relaxed mt-4">
                You can control cookies through your browser settings or our cookie consent banner.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Your information may be transferred to and maintained on servers located outside your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any material changes by email or through a notice on our Service. Your continued use after changes indicates acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">AdsVideo Privacy Team</p>
                <p className="text-gray-600 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:privacy@adsvideo.co"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    privacy@adsvideo.co
                  </a>
                </p>
                <p className="text-gray-600 text-sm">
                  Website:{" "}
                  <a
                    href="https://adsvideo.co"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    https://adsvideo.co
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Back to Home CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 hover:shadow-lg transition-all font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
