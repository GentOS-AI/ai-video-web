"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Home, CreditCard } from "lucide-react";
import { Button } from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService } from "@/lib/api/services";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams?.get('session_id');

    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // Verify payment and get session details
    const verifyPayment = async () => {
      try {
        console.log('✅ Verifying payment session:', sessionId);

        const data = await paymentService.getSessionStatus(sessionId);
        setSessionData(data);

        // Refresh user data to update credits/subscription
        await refreshUser();

        console.log('✅ Payment verified:', data);
      } catch (err) {
        console.error('❌ Failed to verify payment:', err);
        setError('Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, refreshUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/')}
            className="w-full"
          >
            <Home className="w-5 h-5 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Payment Successful!
            </h1>
            <p className="text-white/90 text-sm">
              Thank you for your purchase
            </p>
          </motion.div>
        </div>

        {/* Payment Details */}
        <div className="px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-gray-900 text-xs">
                  {sessionData?.session_id?.substring(0, 20)}...
                </span>
              </div>
              {sessionData?.amount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount Paid</span>
                  <span className="font-bold text-gray-900">
                    ${sessionData.amount.toFixed(2)} {sessionData.currency?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {sessionData?.status || 'Completed'}
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center py-4">
              <p className="text-gray-700 mb-2">
                Your purchase has been processed successfully!
              </p>
              <p className="text-sm text-gray-600">
                Your credits/subscription have been updated.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Home className="w-5 h-5 mr-2" />
                Return Home
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/my-videos')}
                className="w-full"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                View My Account
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            A confirmation email has been sent to your email address
          </p>
        </div>
      </motion.div>
    </div>
  );
}
