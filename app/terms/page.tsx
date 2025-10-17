import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { SimpleHeader } from "@/components/SimpleHeader";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - AdsVideo",
  description:
    "Read our Terms of Service to understand the rules and regulations for using AdsVideo's AI video generation platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  const lastUpdated = "January 15, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30">
      <SimpleHeader
        title="Terms of Service"
        subtitle={`Last updated: ${lastUpdated}`}
        icon={<FileText className="w-6 h-6 text-white" />}
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
                Welcome to AdsVideo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of our AI-powered video generation platform, including our website, services, and applications (collectively, the &quot;Service&quot;).
              </p>
              <p className="text-gray-600 leading-relaxed">
                By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
              </p>
            </section>

            {/* Account Registration */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Account Registration
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use certain features of our Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized account access</li>
              </ul>
            </section>

            {/* Use of Service */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Use of Service
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>Generate content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use automated systems to access the Service without our permission</li>
              </ul>
            </section>

            {/* Subscription and Payment */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Subscription and Payment
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our Service offers subscription-based plans. By subscribing, you agree to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Pay all applicable subscription fees</li>
                <li>Automatic renewal unless cancelled before the renewal date</li>
                <li>Provide current and accurate billing information</li>
                <li>Our 14-day money-back guarantee for new subscriptions</li>
                <li>No refunds for partial months or unused credits</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We reserve the right to modify our pricing with 30 days&apos; notice to active subscribers.
              </p>
            </section>

            {/* Intellectual Property Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Intellectual Property Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Your Content:</strong> You retain all rights to the content you upload to our Service. By uploading content, you grant us a license to process and display it solely for providing the Service.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <strong>Generated Videos:</strong> You own the videos generated through our Service. We grant you a perpetual, worldwide license to use, modify, and distribute your generated videos.
              </p>
              <p className="text-gray-600 leading-relaxed">
                <strong>Our Platform:</strong> The Service, including its software, design, and technology, is owned by AdsVideo and protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            {/* Content Guidelines */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Content Guidelines
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to generate or upload content that:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains nudity, sexual content, or explicit material</li>
                <li>Promotes violence, discrimination, or hate speech</li>
                <li>Contains false or misleading information</li>
                <li>Violates privacy rights or contains personal data without consent</li>
                <li>Is used for spam, phishing, or fraudulent purposes</li>
              </ul>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Termination
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You may cancel your subscription at any time through your account settings. We may terminate or suspend your account immediately if you violate these Terms.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use the Service will cease, but provisions regarding intellectual property, disclaimers, and limitations of liability will survive.
              </p>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. Disclaimers and Limitations of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>The Service will be uninterrupted, secure, or error-free</li>
                <li>Generated videos will meet your specific requirements</li>
                <li>Any errors or defects will be corrected</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                10. Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-gray-700 font-medium mb-2">AdsVideo Support</p>
                <p className="text-gray-600 text-sm">
                  Email:{" "}
                  <a
                    href="mailto:legal@adsvideo.co"
                    className="text-purple-600 hover:text-purple-700"
                  >
                    legal@adsvideo.co
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
