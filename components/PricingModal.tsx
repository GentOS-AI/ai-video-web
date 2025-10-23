"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Crown, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { paymentService } from "@/lib/api/services";
import { redirectToCheckout } from "@/lib/stripe/stripe";
import { PRICING_CONFIG, getSuccessUrl, getCancelUrl } from "@/lib/config/pricing";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (plan: string) => void;
}

export const PricingModal = ({ isOpen, onClose }: PricingModalProps) => {
  const t = useTranslations('pricing');
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  // Individual billing cycle state for each plan - default to yearly
  const [basicBillingCycle, setBasicBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [proBillingCycle, setProBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  // Active plan selection state - default to 'pro'
  const [activePlan, setActivePlan] = useState<'basic' | 'pro'>('pro');

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Basic Plan Configuration - Dynamic based on billing cycle
  const basicPlan = {
    id: "basic",
    name: t('basic.name'),
    price: basicBillingCycle === 'monthly' ? "$34.99" : "$24.99",
    period: "/mo.",
    billingNote: basicBillingCycle === 'monthly' ? t('billedMonthly') : "billed yearly",
    billingNoteColor: 'gray',
    description: t('basic.description'),
    credits: t('monthlyCredits', { count: 1000 }),
    features: [
      t('basic.feature1'),
      t('basic.feature2'),
      t('basic.feature3'),
      t('basic.feature4'),
      t('basic.feature5'),
      t('basic.feature6'),
    ],
    gradient: "from-blue-500 to-cyan-500",
    productType: 'basic' as const,
    isPopular: false,
  };

  // Premium Plan Configuration - Dynamic based on billing cycle
  const proPlan = {
    id: "pro",
    name: t('pro.name'),
    price: proBillingCycle === 'monthly' ? "$54.99" : "$39.99",
    period: "/mo.",
    billingNote: proBillingCycle === 'monthly' ? t('billedMonthly') : "billed yearly",
    description: t('pro.description'),
    credits: t('yearlyCredits', { count: 12000 }),
    features: [
      t('pro.feature1'),
      t('pro.feature2'),
      t('pro.feature3'),
      t('pro.feature4'),
      t('pro.feature5'),
      t('pro.feature6'),
      t('pro.feature7'),
      t('pro.feature8'),
      t('pro.feature9'),
    ],
    gradient: "from-purple-500 to-pink-500",
    productType: 'pro' as const,
    isPopular: true,
  };

  const handleSubscribe = async (productType: 'basic' | 'pro') => {
    // Check authentication
    if (!isAuthenticated) {
      showToast('Please login first to subscribe', 'error');
      return;
    }

    try {
      setIsProcessing(productType);
      console.log(`🛒 Creating checkout session for ${productType} plan...`);

      // Map 'pro' to 'premium' for API compatibility
      const apiProductType = productType === 'pro' ? 'premium' : productType;

      // Create Stripe Checkout Session
      const session = await paymentService.createCheckoutSession(
        apiProductType as 'basic' | 'premium' | 'credits',
        getSuccessUrl(),
        getCancelUrl()
      );

      console.log('✅ Session created:', session.session_id);
      console.log('🔄 Redirecting to Stripe Checkout...');
      console.log('   Checkout URL:', session.url);

      // Redirect to Stripe Checkout using the session URL
      await redirectToCheckout(session.url);

    } catch (error) {
      console.error('❌ Failed to create checkout session:', error);
      showToast('Failed to start checkout. Please try again.', 'error');
      setIsProcessing(null);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-0 bg-black/60 z-[200]"
            onClick={onClose}
            style={{ willChange: "opacity" }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              style={{ willChange: "transform, opacity" }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isProcessing !== null}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/20 transition-colors z-10 disabled:opacity-50"
                aria-label="Close pricing modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header - Simplified */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-5 sm:px-6 sm:py-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {t('title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90">
                    {t('subtitle')}
                  </p>
                </div>

                {PRICING_CONFIG.isDevelopment && (
                  <p className="text-xs text-yellow-300 mt-3 text-center">
                    🧪 Test Mode: ${PRICING_CONFIG.basic.priceValue} / ${PRICING_CONFIG.pro.priceValue}
                  </p>
                )}
              </div>

              {/* Two Plans Side-by-Side */}
              <div className="px-3 py-4 sm:px-5 sm:py-5 bg-gradient-to-b from-white to-purple-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
                  {/* Basic Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    onClick={() => setActivePlan('basic')}
                    className={`relative bg-white rounded-xl overflow-hidden shadow-lg ring-2 transition-all duration-200 cursor-pointer ${
                      activePlan === 'basic'
                        ? 'ring-blue-400 ring-2'
                        : 'ring-gray-200 ring-1 hover:ring-blue-300'
                    }`}
                  >
                    <div className="p-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${basicPlan.gradient} text-white shadow-md`}>
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-xl font-bold text-text-primary">
                                {basicPlan.price}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {basicPlan.period}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-gray-500">
                              {basicPlan.billingNote}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Billing Toggle - Inside Card */}
                      <div className="mb-3">
                        <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 w-full">
                          <button
                            onClick={() => setBasicBillingCycle('monthly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 ${
                              basicBillingCycle === 'monthly'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBasicBillingCycle('yearly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 ${
                              basicBillingCycle === 'yearly'
                                ? 'bg-white text-blue-600 shadow-md'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            Yearly
                          </button>
                        </div>
                      </div>

                      {/* Credits & Description */}
                      <div className="mb-3">
                        <p className="text-[10px] text-text-muted mb-0.5">{basicPlan.credits}</p>
                        <p className="text-[10px] text-text-secondary">
                          {basicPlan.description}
                        </p>
                      </div>

                      {/* Features List - Compact */}
                      <div className="space-y-1.5 mb-3">
                        {basicPlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br ${basicPlan.gradient}`}>
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-text-secondary flex-1 leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Subscribe Button */}
                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isProcessing !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe('basic');
                          }}
                          className={`w-full text-xs transition-all duration-200 ${
                            activePlan === 'basic'
                              ? `bg-gradient-to-r ${basicPlan.gradient} hover:opacity-90 text-white shadow-lg`
                              : `bg-white border-2 border-blue-400 text-blue-600 hover:bg-blue-50`
                          }`}
                        >
                          {isProcessing === 'basic' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            t('subscribeNow')
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pro Plan Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    onClick={() => setActivePlan('pro')}
                    className={`relative bg-white rounded-xl overflow-hidden shadow-lg ring-2 transition-all duration-200 cursor-pointer ${
                      activePlan === 'pro'
                        ? 'ring-purple-500 ring-2'
                        : 'ring-gray-200 ring-1 hover:ring-purple-300'
                    }`}
                  >
                    {/* POPULAR Badge */}
                    {proPlan.isPopular && (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold shadow-lg">
                          {t('popular')}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${proPlan.gradient} text-white shadow-md`}>
                            <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-xl font-bold text-text-primary">
                                {proPlan.price}
                              </span>
                              <span className="text-xs text-text-secondary">
                                {proPlan.period}
                              </span>
                            </div>
                            <p className="text-[10px] font-medium text-purple-600">
                              {proPlan.billingNote}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Billing Toggle - Inside Card */}
                      <div className="mb-3">
                        <div className="inline-flex items-center bg-purple-50 rounded-full p-0.5 w-full">
                          <button
                            onClick={() => setProBillingCycle('monthly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 ${
                              proBillingCycle === 'monthly'
                                ? 'bg-white text-purple-600 shadow-md'
                                : 'text-purple-400 hover:text-purple-600'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setProBillingCycle('yearly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all duration-200 ${
                              proBillingCycle === 'yearly'
                                ? 'bg-white text-purple-600 shadow-md'
                                : 'text-purple-400 hover:text-purple-600'
                            }`}
                          >
                            Yearly
                          </button>
                        </div>
                      </div>

                      {/* Credits & Description */}
                      <div className="mb-3">
                        <p className="text-[10px] text-text-muted mb-0.5">{proPlan.credits}</p>
                        <p className="text-[10px] text-text-secondary">
                          {proPlan.description}
                        </p>
                      </div>

                      {/* Features List - Compact */}
                      <div className="space-y-1.5 mb-3">
                        {proPlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br ${proPlan.gradient}`}>
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-text-secondary flex-1 leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Subscribe Button */}
                      <div className="space-y-2">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isProcessing !== null}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe('pro');
                          }}
                          className={`w-full text-xs transition-all duration-200 ${
                            activePlan === 'pro'
                              ? `bg-gradient-to-r ${proPlan.gradient} hover:opacity-90 text-white shadow-lg`
                              : `bg-white border-2 border-purple-400 text-purple-600 hover:bg-purple-50`
                          }`}
                        >
                          {isProcessing === 'pro' ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            t('subscribeNow')
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-4">
                  <p className="text-[10px] text-center text-gray-500 flex items-center justify-center gap-1 mb-1">
                    <span>🔒</span>
                    <span>Secure payment powered by Stripe</span>
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {t('footerGuarantee')}
                  </p>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {t.rich('footerCustomPlan', {
                      link: (chunks) => (
                        <a href="#contact" className="text-primary hover:underline font-medium">
                          {chunks}
                        </a>
                      )
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
