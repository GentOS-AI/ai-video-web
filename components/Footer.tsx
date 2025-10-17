"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import { AnimatedLogo } from "./AnimatedLogo";

// Lazy load PricingModal
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

export const Footer = () => {
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

        {/* Footer Content - Single column mobile, 4 columns tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AnimatedLogo size={32} />
              <span className="text-xl font-bold flex items-center gap-0.5">
                <span className="text-purple-600">
                  Ads
                </span>
                <span className="text-text-primary">Video.co</span>
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              Transform your ideas into professional advertising videos with
              AI-powered technology.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="text-sm text-text-secondary hover:text-primary transition-colors text-left"
                >
                  Pricing
                </button>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Policy Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Policy
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/terms"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links - Now on the right */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
              Connect With Us
            </h3>
            <div className="flex space-x-4 sm:space-x-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="Github"
              >
                <Github className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 sm:p-2 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 sm:w-5 sm:h-5" />
              </a>
              <a
                href="mailto:contact@aivideo.diy"
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
            {currentYear} AdsVideo. All rights reserved.
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
