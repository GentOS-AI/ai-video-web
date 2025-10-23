"""
Stripe Configuration Module

Manages Stripe API keys and Price IDs based on environment (development/production)
"""
from app.core.config import settings


class StripeConfig:
    """Stripe configuration manager"""

    def __init__(self):
        self.environment = settings.STRIPE_ENVIRONMENT
        self.is_production = self.environment == "production"

    @property
    def secret_key(self) -> str:
        """Get Stripe secret key based on environment"""
        if self.is_production:
            return settings.STRIPE_SECRET_KEY_LIVE
        return settings.STRIPE_SECRET_KEY_TEST

    @property
    def publishable_key(self) -> str:
        """Get Stripe publishable key based on environment"""
        if self.is_production:
            return settings.STRIPE_PUBLISHABLE_KEY_LIVE
        return settings.STRIPE_PUBLISHABLE_KEY_TEST

    @property
    def webhook_secret(self) -> str:
        """Get Stripe webhook secret based on environment"""
        if self.is_production:
            return settings.STRIPE_WEBHOOK_SECRET_LIVE
        return settings.STRIPE_WEBHOOK_SECRET_TEST

    @property
    def basic_price_id(self) -> str:
        """Get Basic plan price ID"""
        if self.is_production:
            return settings.STRIPE_BASIC_PRICE_ID_LIVE
        return settings.STRIPE_BASIC_PRICE_ID_TEST

    @property
    def premium_price_id(self) -> str:
        """Get Premium plan price ID"""
        if self.is_production:
            return settings.STRIPE_PREMIUM_PRICE_ID_LIVE
        return settings.STRIPE_PREMIUM_PRICE_ID_TEST

    @property
    def credits_price_id(self) -> str:
        """Get Credits pack price ID"""
        if self.is_production:
            return settings.STRIPE_CREDITS_PRICE_ID_LIVE
        return settings.STRIPE_CREDITS_PRICE_ID_TEST

    def get_price_id(self, product_type: str) -> str:
        """
        Get price ID by product type

        Args:
            product_type: 'basic', 'premium', or 'credits'

        Returns:
            Stripe Price ID

        Raises:
            ValueError: If product_type is invalid
        """
        price_map = {
            "basic": self.basic_price_id,
            "premium": self.premium_price_id,
            "credits": self.credits_price_id,
        }

        if product_type not in price_map:
            raise ValueError(f"Invalid product type: {product_type}")

        return price_map[product_type]


# Global Stripe configuration instance
stripe_config = StripeConfig()
