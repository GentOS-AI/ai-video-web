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
 * @param sessionId - Stripe Checkout Session ID
 */
export const redirectToCheckout = async (sessionId: string) => {
  try {
    const stripe = await getStripe();

    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }

    console.log('🔄 Redirecting to Stripe Checkout...');

    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      console.error('❌ Stripe redirect error:', error);
      throw error;
    }
  } catch (error) {
    console.error('❌ Failed to redirect to checkout:', error);
    throw error;
  }
};
