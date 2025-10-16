"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./Button";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedLogo } from "./AnimatedLogo";
import Image from "next/image";

// Lazy load PricingModal since it's only shown on user interaction
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

export const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'openid email profile';

    const googleAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;

    window.location.href = googleAuthUrl;
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPricingOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSubscribe = (planName: string) => {
    console.log(`Subscribing to ${planName} plan`);
    // TODO: Integrate with payment system
    alert(`You selected the ${planName} plan! Payment integration coming soon.`);
    setIsPricingOpen(false);
  };

  // Handle click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="w-full md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <AnimatedLogo size={32} />
            <span className="text-xl font-bold flex items-center gap-0.5">
              <span className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Ads
              </span>
              <span className="text-text-primary">Video.co</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handlePricingClick}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Pricing
            </button>

            {loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-purple-bg/50 transition-colors"
                >
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name || 'User'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                      loading="lazy"
                      sizes="32px"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.[0] || user.email[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="hidden sm:flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary">
                        {user.name || 'User'}
                      </span>
                      {user.subscription_plan !== 'free' && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          user.subscription_plan === 'pro'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                        }`}>
                          {user.subscription_plan.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-muted">
                      {user.credits.toFixed(0)} credits
                    </div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {user.email}
                          </p>
                          {user.subscription_plan !== 'free' && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                              user.subscription_plan === 'pro'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                                : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                            }`}>
                              {user.subscription_plan.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">
                          Credits: {user.credits.toFixed(1)}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-purple-bg hover:text-primary transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGoogleLogin}
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md"
              >
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

      {/* Mobile Menu - Optimized Animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
            style={{ willChange: "height, opacity" }}
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={handlePricingClick}
                className="w-full text-left px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors"
              >
                Pricing
              </button>

              {loading ? (
                <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-purple-bg/30 rounded-lg">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.name || 'User'}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                        loading="lazy"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-purple flex items-center justify-center text-white font-semibold">
                        {user.name?.[0] || user.email[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-text-primary">
                          {user.name || 'User'}
                        </p>
                        {user.subscription_plan !== 'free' && (
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            user.subscription_plan === 'pro'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                              : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                          }`}>
                            {user.subscription_plan.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        {user.credits.toFixed(0)} credits
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    handleGoogleLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 shadow-md"
                >
                  Login
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </>
  );
};
