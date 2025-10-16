"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown } from "lucide-react";
import { Button } from "./Button";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  gradient: string;
  credits: string;
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe?: (plan: string) => void;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Basic",
    price: "$19",
    period: "/month",
    description: "Perfect for individuals and small projects",
    credits: "100 credits/month",
    features: [
      "100 AI video generations per month",
      "HD resolution (1080p)",
      "Basic AI models (Sora 1)",
      "Standard processing speed",
      "Email support",
      "5GB cloud storage",
    ],
    icon: <Zap className="w-5 h-5" />,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "Best for professionals and businesses",
    credits: "500 credits/month",
    features: [
      "500 AI video generations per month",
      "4K resolution support",
      "All AI models (Sora 2, Runway Gen-3)",
      "Priority processing (3x faster)",
      "Priority support (24/7)",
      "50GB cloud storage",
      "Custom watermark removal",
      "Advanced editing tools",
      "API access",
    ],
    popular: true,
    icon: <Crown className="w-5 h-5" />,
    gradient: "from-purple-500 to-pink-500",
  },
];

export const PricingModal = ({ isOpen, onClose, onSubscribe }: PricingModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("Pro");

  const handlePlanClick = (planName: string) => {
    setSelectedPlan(planName);
  };

  const handleSubscribe = () => {
    if (onSubscribe) {
      onSubscribe(selectedPlan);
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Close pricing modal"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Header - Simplified Animation */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 sm:px-6 sm:py-4 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Choose Your Plan
                </h2>
                <p className="text-xs sm:text-sm text-white/90">
                  Unlock the power of AI video generation
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gradient-to-b from-white to-purple-50/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {pricingPlans.map((plan) => (
                    <div
                      key={plan.name}
                      onClick={() => handlePlanClick(plan.name)}
                      className={`relative bg-white rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                        selectedPlan === plan.name
                          ? "ring-2 ring-primary shadow-2xl scale-[1.02]"
                          : "border-2 border-gray-200 hover:border-primary/50 shadow-lg hover:shadow-xl"
                      }`}
                      style={{ willChange: "transform" }}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                            POPULAR
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

                        {/* Features List - Show 4 on mobile, 6 on desktop */}
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
                              {/* Show features 5-6 only on desktop */}
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
                                <span className="sm:hidden">+{plan.features.length - 4} more</span>
                                <span className="hidden sm:inline">+{plan.features.length - 6} more</span>
                              </p>
                            </>
                          )}
                        </div>

                        {/* Subscribe Button */}
                        <Button
                          variant={selectedPlan === plan.name ? "primary" : "outline"}
                          size="md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscribe();
                          }}
                          className={`w-full text-sm sm:text-base ${
                            selectedPlan === plan.name
                              ? plan.name === "Pro"
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md"
                                : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-md"
                              : "border-2 border-gray-300 hover:border-primary hover:text-primary bg-white"
                          }`}
                        >
                          Subscribe Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Note - Simplified */}
                <div className="text-center mt-6">
                  <p className="text-xs text-text-muted">
                    All plans include a 14-day money-back guarantee. Cancel anytime.
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Need a custom plan?{" "}
                    <a href="#contact" className="text-primary hover:underline font-medium">
                      Contact us
                    </a>
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
