"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Mail } from "lucide-react";
import { SiTiktok, SiX, SiDiscord, SiLinkedin } from "react-icons/si";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n/config";

// Lazy load PricingModal
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

export const Footer = () => {
  const t = useTranslations('footer');
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const currentYear = new Date().getFullYear();
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const handleSubscribe = (planName: string) => {
    console.log(`Selected ${planName} plan`);
    alert(`You selected the ${planName} plan! Payment integration coming soon.`);
    setIsPricingOpen(false);
  };

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Purple Divider */}
        <div className="h-1 w-full gradient-purple rounded-full mb-8 sm:mb-12" />

        {/* Footer Content - Single column mobile, 5 columns tablet+ */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-4 md:gap-6">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative p-0.5 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-md shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-sm"
                />
              </div>
              <span className="text-xl font-bold flex items-center gap-0">
                <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  Moky
                </span>
                <span className="text-gray-900">Video</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {t('companyDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="text-sm text-text-secondary hover:text-primary transition-colors text-left"
                >
                  {t('pricing')}
                </button>
              </li>
              <li>
                <a
                  href={`/${locale}/about`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {t('aboutUs')}
                </a>
              </li>
            </ul>
          </div>

          {/* Resource Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`/${locale}/help`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/blog`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Policy Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              {t('policy')}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={`/${locale}/terms`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {t('terms')}
                </a>
              </li>
              <li>
                <a
                  href={`/${locale}/privacy`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {t('privacy')}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links - Now on the right */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              {t('connectWithUs')}
            </h3>
            <div className="flex space-x-4 sm:space-x-3">
              <a
                href="https://x.com/mokyvideo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="X (Twitter)"
              >
                <SiX className="w-5 h-5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://discord.gg/mokyvideo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="Discord"
              >
                <SiDiscord className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://linkedin.com/company/mokyvideo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <SiLinkedin className="w-5 h-5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="https://tiktok.com/@mokyvideo"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="TikTok"
              >
                <SiTiktok className="w-5 h-5 sm:w-4 sm:h-4" />
              </a>
              <a
                href="mailto:contact@mokyvideo.com"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-text-muted">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </footer>
  );
};
