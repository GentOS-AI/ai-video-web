"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Sparkles, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLogin = () => setIsLoggedIn(!isLoggedIn);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-purple flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-primary">
              AIVideo.DIY
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Pricing
            </a>

            {isLoggedIn ? (
              <button
                onClick={toggleLogin}
                className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold hover:scale-105 transition-transform"
                aria-label="User profile"
              >
                U
              </button>
            ) : (
              <Button variant="primary" size="sm" onClick={toggleLogin}>
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="px-4 py-4 space-y-3">
              <a
                href="#pricing"
                className="block px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    toggleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-purple-bg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold">
                    U
                  </div>
                  <span className="text-sm font-medium text-text-primary">
                    Profile
                  </span>
                </button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    toggleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
