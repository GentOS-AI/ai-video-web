"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Sparkles, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { paymentService } from "@/lib/api/services";
import { redirectToCheckout } from "@/lib/stripe/stripe";
import { PRICING_CONFIG, getSuccessUrl, getCancelUrl } from "@/lib/config/pricing";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal = ({ isOpen, onClose }: CreditsModalProps) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Active pack selection state - default to 'standard'
  const [selectedPack, setSelectedPack] = useState<'standard' | 'premium'>('standard');

  // Credit packs configuration - 2 packs
  const creditPacks = {
    standard: {
      id: 'standard',
      name: 'Standard Pack',
      credits: 1000,
      price: PRICING_CONFIG.credits.price,
      description: '~10 AI Videos',
      features: [
        `${PRICING_CONFIG.credits.credits} Credits`,
        'No Expiration Date',
        'Instant Delivery',
        'Secure Payment',
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
    premium: {
      id: 'premium',
      name: 'Premium Pack',
      credits: 2500,
      price: '$99.99',
      description: '~25 AI Videos',
      features: [
        '2500 Credits',
        'No Expiration Date',
        'Instant Delivery',
        'Priority Support',
      ],
      gradient: 'from-purple-500 to-pink-500',
    },
  };

  const currentPack = creditPacks[selectedPack];

  const handlePurchase = async () => {
    // Check authentication
    if (!isAuthenticated) {
      showToast('Please login first to purchase credits', 'error');
      return;
    }

    try {
      setIsPurchasing(true);
      console.log('🛒 Creating checkout session for credits pack...');

      // Create Stripe Checkout Session
      const session = await paymentService.createCheckoutSession(
        'credits',
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
      setIsPurchasing(false);
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
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
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
                disabled={isPurchasing}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/20 transition-colors z-10 disabled:opacity-50"
                aria-label="Close credits modal"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Header - Simplified */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-5 sm:px-6 sm:py-6">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    Purchase Credits
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90">
                    Choose the perfect credit pack for your needs
                  </p>
                </div>

                {PRICING_CONFIG.isDevelopment && (
                  <p className="text-xs text-yellow-300 mt-3 text-center">
                    🧪 Test Mode: ${PRICING_CONFIG.credits.priceValue}
                  </p>
                )}
              </div>

              {/* Content - Single Plan Card with Tab Switching */}
              <div className="px-6 py-6">
                {/* Credits Package Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200">
                  {/* Tab Switcher - Compact */}
                  <div className="mb-4 flex justify-center">
                    <div className="inline-flex items-center bg-white rounded-full p-0.5 shadow-sm">
                      <button
                        onClick={() => setSelectedPack('standard')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          selectedPack === 'standard'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        onClick={() => setSelectedPack('premium')}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          selectedPack === 'premium'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Premium
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${currentPack.gradient} rounded-lg flex items-center justify-center shadow-lg`}>
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {currentPack.name}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {currentPack.credits} Credits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {currentPack.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        USD
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    {currentPack.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${currentPack.gradient} flex items-center justify-center`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Purchase Button - Compact */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className={`w-full bg-gradient-to-r ${currentPack.gradient} hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all`}
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">Purchase Now</span>
                    </div>
                  )}
                </Button>

                {/* Footer Note */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure payment powered by Stripe
                  </p>
                  {PRICING_CONFIG.isDevelopment && (
                    <p className="text-xs text-gray-400 mt-1">
                      Test Mode: Use card 4242 4242 4242 4242
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
