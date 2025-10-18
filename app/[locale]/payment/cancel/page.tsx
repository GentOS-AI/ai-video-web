"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, Home, RefreshCw, HelpCircle } from "lucide-react";
import { Button } from "@/components/Button";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Cancel Header */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <XCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Cancelled
            </h1>
            <p className="text-white/90 text-sm">
              Your payment was not completed
            </p>
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Message */}
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                No charges were made to your account.
              </p>
              <p className="text-sm text-gray-600">
                You can try again whenever you're ready.
              </p>
            </div>

            {/* Why did this happen? */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Why did this happen?
                  </h3>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• You clicked the back button</li>
                    <li>• Payment window was closed</li>
                    <li>• Session expired</li>
                    <li>• Payment was declined</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            Need help? Contact our support team at{" "}
            <a href="mailto:support@adsvideo.co" className="text-purple-600 hover:underline">
              support@adsvideo.co
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
