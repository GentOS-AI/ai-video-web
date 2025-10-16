import { Twitter, Github, Linkedin, Mail } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Purple Divider */}
        <div className="h-1 w-full gradient-purple rounded-full mb-8 sm:mb-12" />

        {/* Footer Content - Single column mobile, 3 columns tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="AdsVideo Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-text-primary">
                AdsVideo
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
                <a
                  href="#about"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
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
    </footer>
  );
};
