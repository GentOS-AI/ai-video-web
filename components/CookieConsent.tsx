"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "cookie-consent";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white border-2 border-purple-200 rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative p-4 sm:p-6">
                {/* Close Button */}
                <button
                  onClick={handleDecline}
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Content */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      We use cookies
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      We use cookies to enhance your browsing experience, analyze site traffic, and personalize content.
                      By clicking &quot;Accept All,&quot; you consent to our use of cookies.{" "}
                      <Link
                        href="/privacy"
                        className="text-purple-600 hover:text-purple-700 font-semibold underline"
                      >
                        Learn more
                      </Link>
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleDecline}
                      className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={handleAccept}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>

              {/* Purple gradient bottom border */}
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
