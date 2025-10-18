"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Shield, Clock, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "@/contexts/AuthContext";
import { creditsService } from "@/lib/api/services";

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal = ({ isOpen, onClose }: CreditsModalProps) => {
  const { refreshUser } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const handlePurchase = async () => {
    setIsPurchasing(true);

    try {
      // 调用后端API充值
      const response = await creditsService.purchaseCredits({
        package: "1000_credits",
        payment_method: "demo", // 演示模式
      });

      if (response.success) {
        setPurchaseSuccess(true);

        // 刷新用户信息以更新积分显示
        await refreshUser();

        // 2秒后关闭弹窗
        setTimeout(() => {
          onClose();
          setPurchaseSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Close credits modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Add Credits
                  </h2>
                  <p className="text-sm text-white/90">
                    Power up your AI video generation
                  </p>
                </motion.div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {purchaseSuccess ? (
                  // Success State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Purchase Successful!
                    </h3>
                    <p className="text-sm text-gray-600">
                      1000 credits have been added to your account
                    </p>
                  </motion.div>
                ) : (
                  // Purchase Form
                  <>
                    {/* Credits Package Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200 hover:border-green-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              Credit Pack
                            </h3>
                            <p className="text-xs text-gray-600">
                              1000 Credits
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-gray-900">
                            $49.99
                          </div>
                          <div className="text-xs text-gray-500">
                            USD
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">
                            <strong>~10 AI Videos</strong> (100 credits each)
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Clock className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">
                            No Expiration Date
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Zap className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">
                            Instant Delivery
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Shield className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm text-gray-700">
                            Secure Payment
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Purchase Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      {isPurchasing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                        🔒 Demo Mode: Credits will be added instantly
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Secure payment integration coming soon
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
