/**
 * Pricing Configuration
 *
 * Dynamic pricing based on environment (development/production)
 * Prices are loaded from environment variables
 */

// Check if we're in development mode
const isDevelopment = process.env.NEXT_PUBLIC_STRIPE_ENVIRONMENT === 'development';

// Read prices from environment variables
const getPrice = (devKey: string, prodKey: string, defaultDev: number, defaultProd: number): number => {
  if (isDevelopment) {
    return parseFloat(process.env[devKey] || String(defaultDev));
  }
  return parseFloat(process.env[prodKey] || String(defaultProd));
};

// Get pricing from environment variables
const PRICE_BASIC = getPrice(
  'NEXT_PUBLIC_PRICE_BASIC_DEV',
  'NEXT_PUBLIC_PRICE_BASIC_PROD',
  29.99,
  0.01
);

const PRICE_PRO = getPrice(
  'NEXT_PUBLIC_PRICE_PRO_DEV',
  'NEXT_PUBLIC_PRICE_PRO_PROD',
  129.99,
  0.02
);

const PRICE_CREDITS = getPrice(
  'NEXT_PUBLIC_PRICE_CREDITS_DEV',
  'NEXT_PUBLIC_PRICE_CREDITS_PROD',
  49.99,
  0.03
);

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
    price: `$${PRICE_BASIC.toFixed(2)}`,
    priceValue: PRICE_BASIC,
    period: '/month',
    description: 'Perfect for individuals and small projects',
    credits: 1000,
    features: [
      '1000 credits/month (~UP to 40 videos)',
      'HD resolution (720p)',
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
    price: `$${PRICE_PRO.toFixed(2)}`,
    priceValue: PRICE_PRO,
    period: '/year',
    description: 'For professionals and growing teams',
    credits: 12000,
    features: [
      '12000 credits/year (~UP to 480 videos)',
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
    price: `$${PRICE_CREDITS.toFixed(2)}`,
    priceValue: PRICE_CREDITS,
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
