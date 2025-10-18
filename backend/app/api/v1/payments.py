"""
Payment API Routes

Handles payment-related endpoints:
- Create Checkout Session
- Retrieve payment status
- Get pricing information
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.payment import (
    CreateCheckoutSessionRequest,
    CheckoutSessionResponse,
    PaymentStatusResponse,
    PricingResponse,
    PricingPlan,
    CreditsPack,
)
from app.services.stripe_service import stripe_service
from app.core.stripe_config import stripe_config

router = APIRouter()


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create Stripe Checkout Session

    This endpoint creates a Stripe Checkout Session for:
    - Subscription purchases (Basic/Pro plans)
    - One-time credit purchases

    Args:
        request: Checkout session request data
        current_user: Authenticated user
        db: Database session

    Returns:
        Checkout session details with redirect URL

    Raises:
        HTTPException: If session creation fails
    """
    try:
        print(f"\n💳 Creating checkout session for user: {current_user.email}")
        print(f"   Product type: {request.product_type}")
        print(f"   Environment: {stripe_config.environment}")

        # Create Stripe Checkout Session
        session_data = stripe_service.create_checkout_session(
            user=current_user,
            product_type=request.product_type,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
        )

        print(f"✅ Checkout session created: {session_data['session_id']}")
        print(f"   Redirect URL: {session_data['url']}\n")

        return CheckoutSessionResponse(**session_data)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        print(f"❌ Failed to create checkout session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}",
        )


@router.get("/session/{session_id}", response_model=PaymentStatusResponse)
def get_payment_status(
    session_id: str,
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve payment session status

    Args:
        session_id: Stripe Checkout Session ID
        current_user: Authenticated user

    Returns:
        Payment status information

    Raises:
        HTTPException: If session retrieval fails
    """
    try:
        session = stripe_service.retrieve_session(session_id)

        return PaymentStatusResponse(
            status=session.status,
            session_id=session.id,
            payment_intent_id=session.payment_intent,
            amount=session.amount_total / 100 if session.amount_total else None,
            currency=session.currency,
        )

    except Exception as e:
        print(f"❌ Failed to retrieve session {session_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {str(e)}",
        )


@router.get("/pricing", response_model=PricingResponse)
def get_pricing():
    """
    Get current pricing information

    Returns pricing for all products based on environment:
    - Development: Minimum test prices ($0.50, $1.00)
    - Production: Real prices ($29.99, $129.99, $49.99)

    Returns:
        Complete pricing information for frontend display
    """
    try:
        pricing_data = stripe_service.get_pricing_info()

        # Build response
        plans = [
            PricingPlan(
                id="basic",
                name="Basic Plan",
                price=pricing_data["basic"]["price"],
                currency="USD",
                interval="month",
                credits=pricing_data["basic"]["credits"],
                features=[
                    "500 credits/month",
                    "HD resolution (1080p)",
                    "Sora 2 AI model",
                    "Standard processing speed",
                    "Email support",
                    "10GB cloud storage",
                ],
                stripe_price_id=pricing_data["basic"]["stripe_price_id"],
            ),
            PricingPlan(
                id="pro",
                name="Pro Plan",
                price=pricing_data["pro"]["price"],
                currency="USD",
                interval="year",
                credits=pricing_data["pro"]["credits"],
                features=[
                    "3000 credits/year",
                    "4K resolution support",
                    "Sora 2 Pro model",
                    "Priority processing",
                    "Advanced customization",
                    "Priority support (24/7)",
                    "100GB cloud storage",
                    "API access",
                    "Bulk generation",
                ],
                stripe_price_id=pricing_data["pro"]["stripe_price_id"],
            ),
        ]

        credits_pack = CreditsPack(
            price=pricing_data["credits"]["price"],
            currency="USD",
            credits=pricing_data["credits"]["credits"],
            stripe_price_id=pricing_data["credits"]["stripe_price_id"],
        )

        return PricingResponse(
            environment=pricing_data["environment"],
            plans=plans,
            credits_pack=credits_pack,
        )

    except Exception as e:
        print(f"❌ Failed to get pricing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve pricing information",
        )


@router.get("/config")
def get_stripe_config(current_user: User = Depends(get_current_user)):
    """
    Get Stripe configuration for frontend

    Returns:
        Stripe publishable key and environment info
    """
    return {
        "publishable_key": stripe_config.publishable_key,
        "environment": stripe_config.environment,
    }
