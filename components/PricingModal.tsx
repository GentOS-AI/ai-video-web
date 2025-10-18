"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown, Loader2 } from "lucide-react";
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
  const [selectedPlan, setSelectedPlan] = useState<string>("Pro");
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize pricing plans to avoid recreation on every render (PERFORMANCE OPTIMIZATION)
  const pricingPlans = useMemo(() => [
    {
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
      icon: <Zap className="w-5 h-5" />,
      gradient: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
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
      icon: <Crown className="w-5 h-5" />,
      gradient: "from-purple-500 to-pink-500",
      popular: true,
    },
  ], [t]);

  const handlePlanClick = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleSubscribe = async () => {
    // Check authentication
    if (!isAuthenticated) {
      showToast('Please login first to subscribe', 'error');
      return;
    }

    // Get product type based on selected plan
    const productType = selectedPlan.toLowerCase() as 'basic' | 'pro';

    try {
      setIsProcessing(true);
      console.log(`🛒 Creating checkout session for ${productType} plan...`);

      // Create Stripe Checkout Session
      const session = await paymentService.createCheckoutSession(
        productType,
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
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
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
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 sm:px-6 sm:py-4 text-center">
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

              {/* Pricing Cards */}
              <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-b from-white to-purple-50/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.name}
                      onClick={() => !isProcessing && handlePlanClick(plan.name)}
                      className={`relative bg-white rounded-xl overflow-hidden transition-all duration-150 ${
                        isProcessing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                      } ${
                        selectedPlan === plan.name
                          ? "ring-2 ring-primary shadow-2xl"
                          : "border-2 border-gray-200 hover:border-primary/50 shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            {t('popular')}
                          </div>
                        </div>
                      )}

                      <div className="p-4">
                        {/* Plan Icon & Name */}
                        <div className="flex items-center space-x-2.5 mb-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${plan.gradient} text-white shadow-md`}
                          >
                            {plan.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-text-primary">
                              {plan.name}
                            </h3>
                            <p className="text-xs text-text-muted">{plan.credits}</p>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-bold text-text-primary">
                              {plan.price}
                            </span>
                            <span className="text-base text-text-secondary">
                              {plan.period}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {plan.description}
                          </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                          {plan.features.slice(0, 4).map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <div
                                className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                                  plan.name === "Pro"
                                    ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                }`}
                              >
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-xs text-text-secondary flex-1 leading-relaxed">
                                {feature}
                              </span>
                            </div>
                          ))}
                          {plan.features.length > 4 && (
                            <>
                              <div className="hidden sm:block space-y-2">
                                {plan.features.slice(4, 6).map((feature, idx) => (
                                  <div key={idx + 4} className="flex items-start space-x-2">
                                    <div
                                      className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5 ${
                                        plan.name === "Pro"
                                          ? "bg-gradient-to-br from-purple-500 to-pink-500"
                                          : "bg-gradient-to-br from-blue-500 to-cyan-500"
                                      }`}
                                    >
                                      <Check className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-xs text-text-secondary flex-1 leading-relaxed">
                                      {feature}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-text-muted italic ml-6 pt-0.5">
                                <span className="sm:hidden">{t('moreFeatures', { count: plan.features.length - 4 })}</span>
                                <span className="hidden sm:inline">{t('moreFeatures', { count: plan.features.length - 6 })}</span>
                              </p>
                            </>
                          )}
                        </div>

                        {/* Subscribe Button */}
                        <Button
                          variant={selectedPlan === plan.name ? "primary" : "outline"}
                          size="md"
                          disabled={isProcessing}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe();
                          }}
                          className={`w-full text-sm sm:text-base ${
                            selectedPlan === plan.name
                              ? plan.popular
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md"
                              : "border-2 border-gray-300 hover:border-primary hover:text-primary bg-white"
                          }`}
                        >
                          {isProcessing && selectedPlan === plan.name ? (
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
                  ))}
                </div>

                {/* Footer Note */}
                <div className="text-center mt-6">
                  <p className="text-xs text-text-muted">
                    {t('footerGuarantee')}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
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
