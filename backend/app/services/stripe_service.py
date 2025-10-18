"""
Stripe Payment Service

Handles all Stripe-related operations:
- Checkout Session creation
- Subscription management
- Payment verification
- Webhook event processing
"""
import stripe
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.stripe_config import stripe_config
from app.models.user import User
from app.core.config import settings

# Initialize Stripe with secret key
stripe.api_key = stripe_config.secret_key


class StripeService:
    """Service for Stripe payment operations"""

    def __init__(self):
        self.config = stripe_config

    def create_checkout_session(
        self,
        user: User,
        product_type: str,
        success_url: str,
        cancel_url: str,
    ) -> Dict[str, str]:
        """
        Create Stripe Checkout Session

        Args:
            user: Current user
            product_type: 'basic', 'pro', or 'credits'
            success_url: Redirect URL after successful payment
            cancel_url: Redirect URL if payment cancelled

        Returns:
            Dictionary with session_id and checkout URL

        Raises:
            ValueError: If product_type is invalid
            stripe.error.StripeError: If Stripe API fails
        """
        # Get price ID based on product type
        price_id = self.config.get_price_id(product_type)

        # Determine session mode based on product type
        if product_type == "credits":
            mode = "payment"  # One-time payment
            line_items = [
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ]
        else:
            mode = "subscription"  # Recurring subscription
            line_items = [
                {
                    "price": price_id,
                    "quantity": 1,
                }
            ]

        # Create Checkout Session
        session = stripe.checkout.Session.create(
            customer_email=user.email,
            client_reference_id=str(user.id),  # Link session to our user
            mode=mode,
            line_items=line_items,
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            metadata={
                "user_id": user.id,
                "product_type": product_type,
                "environment": self.config.environment,
            },
        )

        return {
            "session_id": session.id,
            "url": session.url,
            "publishable_key": self.config.publishable_key,
        }

    def retrieve_session(self, session_id: str) -> stripe.checkout.Session:
        """
        Retrieve Checkout Session details

        Args:
            session_id: Stripe Checkout Session ID

        Returns:
            Stripe Checkout Session object
        """
        return stripe.checkout.Session.retrieve(session_id)

    def verify_webhook_signature(
        self, payload: bytes, signature: str
    ) -> Optional[stripe.Event]:
        """
        Verify Stripe webhook signature

        Args:
            payload: Raw request body
            signature: Stripe signature from headers

        Returns:
            Verified Stripe Event object or None if verification fails
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, self.config.webhook_secret
            )
            return event
        except ValueError as e:
            # Invalid payload
            print(f"❌ Invalid webhook payload: {e}")
            return None
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            print(f"❌ Invalid webhook signature: {e}")
            return None

    def handle_checkout_completed(
        self, session: Dict[str, Any], db: Session
    ) -> None:
        """
        Handle successful checkout completion

        Args:
            session: Stripe Checkout Session data
            db: Database session
        """
        user_id = int(session["metadata"]["user_id"])
        product_type = session["metadata"]["product_type"]

        print(f"✅ Checkout completed for user {user_id}, product: {product_type}")

        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User {user_id} not found")
            return

        # Handle different product types
        if product_type == "credits":
            # One-time credits purchase
            credits_to_add = 1000
            user.credits += credits_to_add
            print(f"   💰 Added {credits_to_add} credits to user {user.email}")

        elif product_type == "basic":
            # Monthly Basic subscription
            user.subscription_plan = "basic"
            user.subscription_status = "active"
            print(f"   📦 Activated Basic plan for user {user.email}")

        elif product_type == "pro":
            # Yearly Pro subscription
            user.subscription_plan = "pro"
            user.subscription_status = "active"
            print(f"   👑 Activated Pro plan for user {user.email}")

        db.commit()
        print(f"✅ Database updated successfully")

    def handle_subscription_updated(
        self, subscription: Dict[str, Any], db: Session
    ) -> None:
        """
        Handle subscription updates (renewal, cancellation, etc.)

        Args:
            subscription: Stripe Subscription data
            db: Database session
        """
        customer_email = subscription.get("customer_email")
        status = subscription.get("status")

        print(f"🔄 Subscription updated: {customer_email}, status: {status}")

        # Find user by email
        user = db.query(User).filter(User.email == customer_email).first()
        if not user:
            print(f"❌ User with email {customer_email} not found")
            return

        # Update subscription status
        if status == "active":
            user.subscription_status = "active"
        elif status == "canceled":
            user.subscription_status = "cancelled"
        elif status == "past_due":
            user.subscription_status = "expired"

        db.commit()
        print(f"✅ Subscription status updated for {user.email}")

    def handle_subscription_deleted(
        self, subscription: Dict[str, Any], db: Session
    ) -> None:
        """
        Handle subscription cancellation

        Args:
            subscription: Stripe Subscription data
            db: Database session
        """
        customer_email = subscription.get("customer_email")

        print(f"❌ Subscription deleted for {customer_email}")

        user = db.query(User).filter(User.email == customer_email).first()
        if not user:
            return

        # Downgrade to free plan
        user.subscription_plan = "free"
        user.subscription_status = "expired"

        db.commit()
        print(f"✅ User {user.email} downgraded to free plan")

    def get_pricing_info(self) -> Dict[str, Any]:
        """
        Get current pricing information based on environment

        Returns:
            Dictionary with pricing details for all products
        """
        if self.config.is_production:
            return {
                "environment": "production",
                "basic": {
                    "price": 29.99,
                    "interval": "month",
                    "credits": 500,
                    "stripe_price_id": self.config.basic_price_id,
                },
                "pro": {
                    "price": 129.99,
                    "interval": "year",
                    "credits": 3000,
                    "stripe_price_id": self.config.pro_price_id,
                },
                "credits": {
                    "price": 49.99,
                    "credits": 1000,
                    "stripe_price_id": self.config.credits_price_id,
                },
            }
        else:
            # Development/Test environment with minimum prices
            return {
                "environment": "development",
                "basic": {
                    "price": 0.50,
                    "interval": "month",
                    "credits": 500,
                    "stripe_price_id": self.config.basic_price_id,
                },
                "pro": {
                    "price": 1.00,
                    "interval": "year",
                    "credits": 3000,
                    "stripe_price_id": self.config.pro_price_id,
                },
                "credits": {
                    "price": 0.50,
                    "credits": 1000,
                    "stripe_price_id": self.config.credits_price_id,
                },
            }


# Global service instance
stripe_service = StripeService()
