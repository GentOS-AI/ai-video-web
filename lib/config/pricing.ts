"""
Pricing Configuration

Dynamic pricing based on environment (development/production)
"""

// Check if we're in development mode
const isDevelopment = process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT === 'development';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  description: string;
  credits: number;
  features: string[];
  popular?: boolean;
}

export interface CreditsPack {
  price: string;
  priceValue: number;
  credits: number;
}

/**
 * Pricing configuration
 * Automatically switches between development and production prices
 */
export const PRICING_CONFIG = {
  environment: isDevelopment ? 'development' : 'production',
  isDevelopment,

  // Basic Plan (Monthly Subscription)
  basic: {
    id: 'basic',
    name: 'Basic',
    price: isDevelopment ? '$0.50' : '$29.99',
    priceValue: isDevelopment ? 0.50 : 29.99,
    period: '/month',
    description: 'Perfect for individuals and small projects',
    credits: 500,
    features: [
      '500 credits/month (~5 videos)',
      'HD resolution (1080p)',
      'Sora 2 AI model',
      'Standard processing speed',
      'Email support',
      '10GB cloud storage',
    ],
    popular: false,
  } as PricingPlan,

  // Pro Plan (Yearly Subscription)
  pro: {
    id: 'pro',
    name: 'Pro',
    price: isDevelopment ? '$1.00' : '$129.99',
    priceValue: isDevelopment ? 1.00 : 129.99,
    period: '/year',
    description: 'For professionals and growing teams',
    credits: 3000,
    features: [
      '3000 credits/year (~30 videos)',
      '4K resolution support',
      'Sora 2 Pro model',
      'Priority processing',
      'Advanced customization',
      'Priority support (24/7)',
      '100GB cloud storage',
      'API access',
      'Bulk generation',
    ],
    popular: true,
  } as PricingPlan,

  // Credits Pack (One-time Purchase)
  credits: {
    price: isDevelopment ? '$0.50' : '$49.99',
    priceValue: isDevelopment ? 0.50 : 49.99,
    credits: 1000,
  } as CreditsPack,
};

/**
 * Get success URL for Stripe Checkout
 */
export const getSuccessUrl = () => {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';
  return `${baseUrl}/payment/success`;
};

/**
 * Get cancel URL for Stripe Checkout
 */
export const getCancelUrl = () => {
  const baseUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';
  return `${baseUrl}/payment/cancel`;
};
