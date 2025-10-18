"""
Stripe Webhook Handlers

Receives and processes Stripe webhook events:
- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
"""
from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.payment import WebhookEventResponse
from app.services.stripe_service import stripe_service

router = APIRouter()


@router.post("/stripe", response_model=WebhookEventResponse)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Handle Stripe webhook events

    This endpoint receives webhook events from Stripe and processes them.
    Important: This endpoint does NOT require authentication (Stripe calls it)

    Webhook signature verification is performed to ensure authenticity.

    Supported events:
    - checkout.session.completed: Payment successful
    - customer.subscription.created: New subscription
    - customer.subscription.updated: Subscription changed
    - customer.subscription.deleted: Subscription cancelled
    - invoice.payment_succeeded: Payment succeeded
    - invoice.payment_failed: Payment failed

    Args:
        request: FastAPI request object (contains raw body and headers)
        db: Database session

    Returns:
        Confirmation that webhook was received and processed

    Raises:
        HTTPException: If signature verification fails
    """
    # Get raw request body and signature
    payload = await request.body()
    signature = request.headers.get("stripe-signature")

    if not signature:
        print("❌ Missing Stripe signature header")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header",
        )

    # Verify webhook signature
    event = stripe_service.verify_webhook_signature(payload, signature)

    if not event:
        print("❌ Invalid webhook signature")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid webhook signature",
        )

    # Log received event
    event_type = event["type"]
    print(f"\n🔔 Received Stripe webhook: {event_type}")
    print(f"   Event ID: {event['id']}")

    # Process different event types
    try:
        if event_type == "checkout.session.completed":
            # Payment completed successfully
            session = event["data"]["object"]
            print(f"   Session ID: {session['id']}")
            print(f"   Amount: ${session['amount_total'] / 100} {session['currency'].upper()}")

            stripe_service.handle_checkout_completed(session, db)

        elif event_type == "customer.subscription.created":
            # New subscription created
            subscription = event["data"]["object"]
            print(f"   Subscription ID: {subscription['id']}")
            print(f"   Status: {subscription['status']}")

            stripe_service.handle_subscription_updated(subscription, db)

        elif event_type == "customer.subscription.updated":
            # Subscription updated (renewal, plan change, etc.)
            subscription = event["data"]["object"]
            print(f"   Subscription ID: {subscription['id']}")
            print(f"   New status: {subscription['status']}")

            stripe_service.handle_subscription_updated(subscription, db)

        elif event_type == "customer.subscription.deleted":
            # Subscription cancelled
            subscription = event["data"]["object"]
            print(f"   Subscription ID: {subscription['id']}")

            stripe_service.handle_subscription_deleted(subscription, db)

        elif event_type == "invoice.payment_succeeded":
            # Recurring payment succeeded
            invoice = event["data"]["object"]
            print(f"   Invoice ID: {invoice['id']}")
            print(f"   Amount: ${invoice['amount_paid'] / 100} {invoice['currency'].upper()}")
            print(f"   ✅ Payment succeeded")

        elif event_type == "invoice.payment_failed":
            # Recurring payment failed
            invoice = event["data"]["object"]
            print(f"   Invoice ID: {invoice['id']}")
            print(f"   ❌ Payment failed")

        else:
            # Unhandled event type (just log it)
            print(f"   ℹ️ Unhandled event type: {event_type}")

        print(f"✅ Webhook processed successfully\n")

        return WebhookEventResponse(
            received=True,
            event_type=event_type,
            message=f"Webhook {event_type} processed successfully",
        )

    except Exception as e:
        print(f"❌ Error processing webhook: {e}\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process webhook: {str(e)}",
        )
