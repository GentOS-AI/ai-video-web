"""
Payment and Stripe related schemas
"""
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ========================================
# Request Schemas
# ========================================

class CreateCheckoutSessionRequest(BaseModel):
    """Request to create Stripe Checkout Session"""
    product_type: Literal["basic", "pro", "credits"] = Field(
        ...,
        description="Product type: basic (monthly subscription), pro (yearly subscription), or credits (one-time purchase)"
    )
    success_url: str = Field(
        ...,
        description="URL to redirect after successful payment"
    )
    cancel_url: str = Field(
        ...,
        description="URL to redirect if payment is cancelled"
    )


# ========================================
# Response Schemas
# ========================================

class CheckoutSessionResponse(BaseModel):
    """Response after creating Checkout Session"""
    session_id: str = Field(..., description="Stripe Checkout Session ID")
    url: str = Field(..., description="Stripe Checkout URL to redirect user")
    publishable_key: str = Field(..., description="Stripe publishable key for frontend")


class PaymentStatusResponse(BaseModel):
    """Payment status information"""
    status: Literal["pending", "processing", "succeeded", "failed", "cancelled"]
    session_id: str
    payment_intent_id: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None


class WebhookEventResponse(BaseModel):
    """Webhook event processing response"""
    received: bool = True
    event_type: str
    message: str


# ========================================
# Subscription & Credits Info
# ========================================

class SubscriptionInfo(BaseModel):
    """User subscription information"""
    plan: Literal["free", "basic", "pro"]
    status: Literal["active", "cancelled", "expired"]
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False


class CreditsBalance(BaseModel):
    """User credits balance"""
    credits: float
    last_updated: str


# ========================================
# Pricing Information (for frontend)
# ========================================

class PricingPlan(BaseModel):
    """Pricing plan information"""
    id: str  # 'basic' or 'pro'
    name: str
    price: float
    currency: str = "USD"
    interval: Literal["month", "year"]
    credits: int
    features: list[str]
    stripe_price_id: str


class CreditsPack(BaseModel):
    """Credits pack information"""
    id: str = "credits"
    name: str = "Credit Pack"
    price: float
    currency: str = "USD"
    credits: int = 1000
    stripe_price_id: str


class PricingResponse(BaseModel):
    """Complete pricing information"""
    environment: Literal["development", "production"]
    plans: list[PricingPlan]
    credits_pack: CreditsPack
