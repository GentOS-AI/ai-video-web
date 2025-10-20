"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Shield, Clock, Sparkles, Loader2 } from "lucide-react";
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
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
              style={{ willChange: "transform, opacity" }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isPurchasing}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 disabled:opacity-50"
                aria-label="Close credits modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header with Gradient - Optimized */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-8 text-center relative overflow-hidden">
                {/* Simplified Background Pattern - No motion */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                </div>

                {/* Removed motion wrapper for better performance */}
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Add Credits
                  </h2>
                  <p className="text-sm text-white/90">
                    Power up your AI video generation
                  </p>
                  {PRICING_CONFIG.isDevelopment && (
                    <p className="text-xs text-yellow-300 mt-2">
                      🧪 Test Mode: ${PRICING_CONFIG.credits.priceValue}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Credits Package Card - Removed motion for better performance */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border-2 border-purple-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Credit Pack
                        </h3>
                        <p className="text-xs text-gray-600">
                          {PRICING_CONFIG.credits.credits} Credits
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {PRICING_CONFIG.credits.price}
                      </div>
                      <div className="text-xs text-gray-500">
                        USD
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        <strong>~10 AI Videos</strong> (100 credits each)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Clock className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        No Expiration Date
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Instant Delivery
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">
                        Secure Payment
                      </span>
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isPurchasing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Sparkles className="w-5 h-5" />
                      <span>Purchase Now</span>
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
