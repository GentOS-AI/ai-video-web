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
        price: PRICING_CONFIG.pro.price,
        period: t('pro.period'),
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
      };
    } else {
      return {
        id: "basic",
        name: t('basic.name'),
        price: PRICING_CONFIG.basic.price,
        period: t('basic.period'),
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
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 disabled:opacity-50"
                aria-label="Close pricing modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-6 sm:px-6 sm:py-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {t('title')}
                </h2>
                <p className="text-xs sm:text-sm text-white/90">
                  {t('subtitle')}
                </p>
                {PRICING_CONFIG.isDevelopment && (
                  <p className="text-xs text-yellow-300 mt-2">
                    🧪 Test Mode: ${PRICING_CONFIG.basic.priceValue} / ${PRICING_CONFIG.pro.priceValue}
                  </p>
                )}
              </div>

              {/* Billing Cycle Toggle Switch */}
              <div className="px-4 py-3 sm:px-5 sm:py-4 bg-gradient-to-b from-white to-purple-50/30">
                <div className="flex items-center justify-center mb-4">
                  <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-purple-600 shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        billingCycle === 'yearly'
                          ? 'bg-white text-purple-600 shadow-md'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        Yearly
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-bold">
                          POPULAR
                        </span>
                      </span>
                    </button>
                  </div>
                </div>

                {/* Single Plan Card with Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={billingCycle}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-white rounded-xl overflow-hidden shadow-2xl ring-2 ring-purple-500"
                  >
                    <div className="p-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${currentPlan.gradient} text-white shadow-md`}
                          >
                            <Crown className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-text-primary">
                              {currentPlan.name}
                            </h3>
                            <p className="text-xs text-text-muted">{currentPlan.credits}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        <div className="flex items-baseline space-x-1">
                          <span className="text-3xl font-bold text-text-primary">
                            {currentPlan.price}
                          </span>
                          <span className="text-base text-text-secondary">
                            {currentPlan.period}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">
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
