"use client";

import { useState, useMemo } from "react";
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
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'monthly'>('yearly'); // Default to Yearly
  const [isProcessing, setIsProcessing] = useState(false);

  // Define plan details based on billing cycle
  const currentPlan = useMemo(() => {
    if (billingCycle === 'yearly') {
      return {
        id: "pro",
        name: t('pro.name'),
        price: "$19.99",
        period: "/mo.",
        billingNote: t('billedAnnually'),
        description: t('pro.description'),
        credits: t('yearlyCredits', { count: 3000 }),
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
    } else {
      return {
        id: "basic",
        name: t('basic.name'),
        price: PRICING_CONFIG.basic.price,
        period: "/mo.",
        billingNote: t('billedMonthly'),
        billingNoteColor: 'gray',
        description: t('basic.description'),
        credits: t('monthlyCredits', { count: 500 }),
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
    }
  }, [billingCycle, t]);

  const handleSubscribe = async () => {
    // Check authentication
    if (!isAuthenticated) {
      showToast('Please login first to subscribe', 'error');
      return;
    }

    try {
      setIsProcessing(true);
      console.log(`🛒 Creating checkout session for ${currentPlan.productType} plan...`);

      // Create Stripe Checkout Session
      const session = await paymentService.createCheckoutSession(
        currentPlan.productType,
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
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop - Optimized without blur */}
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
              style={{ willChange: "transform, opacity" }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/20 transition-colors z-10 disabled:opacity-50"
                aria-label="Close pricing modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header with Integrated Switch */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-5 sm:px-6 sm:py-6">
                <div className="text-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {t('title')}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90">
                    {t('subtitle')}
                  </p>
                </div>

                {/* Billing Cycle Toggle Switch - Integrated in Header */}
                <div className="flex items-center justify-center">
                  <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full p-0.5">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`relative px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`relative px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                        billingCycle === 'yearly'
                          ? 'bg-white text-purple-600 shadow-lg'
                          : 'text-white/80 hover:text-white'
                      }`}
                    >
                      Yearly
                    </button>
                  </div>
                </div>

                {PRICING_CONFIG.isDevelopment && (
                  <p className="text-xs text-yellow-300 mt-3 text-center">
                    🧪 Test Mode: ${PRICING_CONFIG.basic.priceValue} / ${PRICING_CONFIG.pro.priceValue}
                  </p>
                )}
              </div>

              {/* Plan Card Container */}
              <div className="px-4 py-4 sm:px-5 sm:py-5 bg-gradient-to-b from-white to-purple-50/30">
                {/* Single Plan Card with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={billingCycle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className={`relative bg-white rounded-xl overflow-hidden shadow-2xl ring-2 ${
                      billingCycle === 'yearly' ? 'ring-purple-500' : 'ring-blue-400'
                    }`}
                  >
                    {/* POPULAR Badge - Only for Yearly Plan */}
                    {currentPlan.isPopular && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold shadow-lg">
                          {t('popular')}
                        </span>
                      </div>
                    )}

                    <div className="p-4">
                      {/* Plan Header with Price */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${currentPlan.gradient} text-white shadow-md`}
                          >
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-baseline space-x-1">
                              <span className="text-2xl font-bold text-text-primary">
                                {currentPlan.price}
                              </span>
                              <span className="text-sm text-text-secondary">
                                {currentPlan.period}
                              </span>
                            </div>
                            {'billingNote' in currentPlan && (
                              <p className={`text-[10px] font-medium ${
                                'billingNoteColor' in currentPlan && currentPlan.billingNoteColor === 'gray'
                                  ? 'text-gray-500'
                                  : 'text-purple-600'
                              }`}>
                                {currentPlan.billingNote}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Credits & Description */}
                      <div className="mb-4">
                        <p className="text-xs text-text-muted mb-1">{currentPlan.credits}</p>
                        <p className="text-xs text-text-secondary">
                          {currentPlan.description}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 mb-4">
                        {currentPlan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <div
                              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 bg-gradient-to-br ${currentPlan.gradient}`}
                            >
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </div>
                            <span className="text-xs text-text-secondary flex-1 leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Subscribe Button */}
                      <Button
                        variant="primary"
                        size="md"
                        disabled={isProcessing}
                        onClick={handleSubscribe}
                        className={`w-full text-sm bg-gradient-to-r ${currentPlan.gradient} hover:opacity-90 text-white shadow-lg`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          t('subscribeNow')
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Footer Note */}
                <div className="text-center mt-4">
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
