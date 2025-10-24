"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Button } from "./Button";
import { Menu, X, LogOut, Film, Globe } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedLogo } from "./AnimatedLogo";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation";
// useRouter commented out - only needed when multi-language support is enabled
// import { useRouter } from "next/navigation";
import { localeFlags, localeNames, type Locale } from "@/lib/i18n/config";

// Lazy load PricingModal since it's only shown on user interaction
const PricingModal = dynamic(
  () => import("./PricingModal").then((mod) => ({ default: mod.PricingModal })),
  { ssr: false }
);

// Lazy load CreditsModal
const CreditsModal = dynamic(
  () => import("./CreditsModal").then((mod) => ({ default: mod.CreditsModal })),
  { ssr: false }
);

export const Navbar = () => {
  const t = useTranslations('navbar');
  const params = useParams();
  const pathname = usePathname();
  // router commented out - only needed when multi-language support is enabled
  // const router = useRouter();
  const locale = (params.locale as Locale) || 'en';

  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isMobileLangMenuOpen, setIsMobileLangMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const logoRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | undefined>(undefined);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef(0);

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

  const handleAddCredits = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCreditsModalOpen(true);
    setShowUserMenu(false);
  };

  const handleLanguageChange = (newLocale: Locale) => {
    // Get current path without locale prefix
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // Navigate to new locale path
    window.location.href = `/${newLocale}${pathWithoutLocale}`;
    setIsLangMenuOpen(false);
  };

  // Language list - All languages enabled
  const languages: Array<{ code: Locale; name: string; flag: string }> = [
    { code: 'en', name: localeNames['en'], flag: localeFlags['en'] },
    { code: 'zh', name: localeNames['zh'], flag: localeFlags['zh'] },
    { code: 'zh-TW', name: localeNames['zh-TW'], flag: localeFlags['zh-TW'] },
    { code: 'ja', name: localeNames['ja'], flag: localeFlags['ja'] },
  ];

  // Helper function to check if a path is active
  const isActivePath = (path: string) => {
    // Remove locale from pathname for comparison
    const currentPath = pathname.replace(`/${locale}`, '') || '/';
    const targetPath = path.replace(`/${locale}`, '') || '/';

    // Exact match for home page
    if (targetPath === '/') {
      return currentPath === '/';
    }

    // For other pages, check if current path starts with target path
    return currentPath.startsWith(targetPath);
  };

  // Handle scroll to trigger logo rotation based on direction - Performance optimized
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;

        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }

        animationFrameId.current = requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollDiff = currentScrollY - lastScrollY.current;

          // Only trigger if scrolled more than 100px from last position
          if (Math.abs(scrollDiff) > 100) {
            const logo = logoRef.current;
            if (logo) {
              // Scrolling down: clockwise (+360), up: counter-clockwise (-360)
              const rotationDelta = scrollDiff > 0 ? 360 : -360;
              currentRotation.current += rotationDelta;

              // Apply rotation directly via CSS for best performance
              logo.style.transform = `rotate(${currentRotation.current}deg)`;
              logo.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

              lastScrollY.current = currentScrollY;
            }
          }

          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Handle click outside to close user menu and language menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    if (showUserMenu || isLangMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, isLangMenuOpen]);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[60] bg-white/95 border-b border-gray-200 shadow-sm"
      >
      <div className="w-full md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link href={`/${locale}`} className="flex items-center space-x-1.5 cursor-pointer group">
            <div
              ref={logoRef}
              className="transition-transform duration-200 ease-out group-hover:scale-105"
              style={{ display: 'inline-block' }}
            >
              <AnimatedLogo size={32} />
            </div>
            <span className="text-xl font-bold transition-opacity duration-200 group-hover:opacity-80 flex items-center gap-0">
              <span className="text-gray-900">Video</span>
              <span className="bg-gradient-to-r from-yellow-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">4Ads</span>
            </span>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-4 absolute left-1/2 -translate-x-1/2">
            <Link
              href={`/${locale}`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                isActivePath(`/${locale}`)
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              {t('home')}
              {isActivePath(`/${locale}`) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <Link
              href={`/${locale}/about`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                isActivePath(`/${locale}/about`)
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              {t('about')}
              {isActivePath(`/${locale}/about`) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                pathname.includes('/blog')
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              Blog
              {pathname.includes('/blog') && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <Link
              href={`/${locale}/help`}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                isActivePath(`/${locale}/help`)
                  ? 'text-primary font-semibold'
                  : 'text-text-secondary hover:text-primary'
              }`}
            >
              FAQ
              {isActivePath(`/${locale}/help`) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
            <button
              onClick={handlePricingClick}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              {t('pricing')}
            </button>
          </div>

          {/* Right Section - Language & User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Language Switcher - Desktop */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-gray-700 hover:text-gray-900 group"
                aria-label="Switch language"
              >
                <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                <span className="text-xs font-medium">{localeNames[locale]}</span>
              </button>

              {/* Language Dropdown Menu */}
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[100] overflow-hidden"
                    style={{ transformOrigin: 'top right', willChange: 'transform, opacity' }}
                  >
                    {languages.map((lang, index) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full px-4 py-2.5 text-left transition-all duration-150 flex items-center justify-between group ${
                          locale === lang.code
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        } ${index !== languages.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        <span className="text-sm font-medium">{lang.name}</span>
                        {locale === lang.code && (
                          <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                      quality={75}
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
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                          {user.subscription_plan === 'basic' ? 'BASIC' : 'PREMIUM'}
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[100]"
                      style={{ transformOrigin: 'top right', willChange: 'transform, opacity' }}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-text-primary truncate mb-1">
                          {user.email}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-text-muted">
                            {t('credits', { count: user.credits.toFixed(0) })}
                          </p>
                          <button
                            onClick={handleAddCredits}
                            className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                      <Link
                        href={`/${locale}/my-videos`}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-purple-bg hover:text-primary transition-colors flex items-center space-x-2"
                      >
                        <Film className="w-4 h-4" />
                        <span>{t('myVideos')}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-text-secondary hover:bg-purple-bg hover:text-primary transition-colors flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout')}</span>
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
                {t('login')}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              if (isMobileMenuOpen) {
                setIsMobileLangMenuOpen(false);
              }
            }}
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
              <Link
                href={`/${locale}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActivePath(`/${locale}`)
                    ? 'bg-purple-bg text-primary font-semibold'
                    : 'text-text-secondary hover:text-primary hover:bg-purple-bg'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                href={`/${locale}/about`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActivePath(`/${locale}/about`)
                    ? 'bg-purple-bg text-primary font-semibold'
                    : 'text-text-secondary hover:text-primary hover:bg-purple-bg'
                }`}
              >
                {t('about')}
              </Link>
              <Link
                href={`/${locale}/blog`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname.includes('/blog')
                    ? 'bg-purple-bg text-primary font-semibold'
                    : 'text-text-secondary hover:text-primary hover:bg-purple-bg'
                }`}
              >
                Blog
              </Link>
              <Link
                href={`/${locale}/help`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActivePath(`/${locale}/help`)
                    ? 'bg-purple-bg text-primary font-semibold'
                    : 'text-text-secondary hover:text-primary hover:bg-purple-bg'
                }`}
              >
                FAQ
              </Link>
              <button
                onClick={handlePricingClick}
                className="w-full text-left px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors"
              >
                {t('pricing')}
              </button>

              {/* Language Menu - Mobile (Collapsible) */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={() => setIsMobileLangMenuOpen(!isMobileLangMenuOpen)}
                  className="w-full px-4 py-2.5 rounded-lg text-left transition-all duration-150 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{localeNames[locale]}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isMobileLangMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Collapsible Language Options */}
                <AnimatePresence>
                  {isMobileLangMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-2 pt-2 space-y-1">
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              handleLanguageChange(lang.code);
                              setIsMobileMenuOpen(false);
                              setIsMobileLangMenuOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 rounded-lg text-left transition-all duration-150 flex items-center justify-between ${
                              locale === lang.code
                                ? 'bg-purple-50 text-purple-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm">{lang.name}</span>
                            {locale === lang.code && (
                              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

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
                        quality={75}
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
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                            {user.subscription_plan === 'basic' ? 'BASIC' : 'PREMIUM'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted">
                        {user.credits.toFixed(0)} credits
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/my-videos`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Film className="w-4 h-4" />
                    <span>{t('myVideos')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-purple-bg rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('logout')}</span>
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
                  {t('login')}
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

      {/* Credits Modal */}
      <CreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
      />
    </>
  );
};
