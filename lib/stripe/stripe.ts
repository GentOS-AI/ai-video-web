/**
 * Stripe Client Wrapper
 *
 * Handles Stripe.js initialization and payment operations
 */
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe.js instance
 * Lazily loads Stripe.js with the publishable key
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error('❌ Stripe publishable key not found in environment variables');
      throw new Error('Stripe publishable key not configured');
    }

    console.log('🔑 Loading Stripe with key:', publishableKey.substring(0, 20) + '...');
    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Redirect to Stripe Checkout
 *
 * Modern approach: Use the checkout URL directly from the session
 * Note: Stripe.js v4+ no longer supports redirectToCheckout()
 *
 * @param checkoutUrl - Stripe Checkout Session URL
 */
export const redirectToCheckout = async (checkoutUrl: string) => {
  try {
    console.log('🔄 Redirecting to Stripe Checkout...');

    // Direct redirect to Stripe Checkout URL
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('❌ Failed to redirect to checkout:', error);
    throw error;
  }
};
