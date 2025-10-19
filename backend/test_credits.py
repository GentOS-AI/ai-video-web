#!/usr/bin/env python3
"""
Test script to verify credit addition functionality
"""
import os
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine
from app.models.user import User
from app.services.stripe_service import stripe_service

def test_credit_addition():
    """Test credit addition logic"""
    print("\n=== Testing Credit Addition ===\n")

    # Create a database session
    db = SessionLocal()

    try:
        # Get a test user or the first user
        user = db.query(User).first()

        if not user:
            print("❌ No users found in database")
            return

        print(f"Testing with user: {user.email}")
        print(f"Current credits: {user.credits}")
        print(f"Current plan: {user.subscription_plan}")
        print(f"Current status: {user.subscription_status}")

        # Simulate a checkout.session.completed event for credits
        test_session = {
            "id": "cs_test_123456",
            "metadata": {
                "user_id": str(user.id),
                "product_type": "credits",
                "environment": "development"
            },
            "amount_total": 50,  # $0.50 in cents
            "currency": "usd",
            "payment_status": "paid"
        }

        print("\n📋 Simulating checkout.session.completed event...")
        print(f"   Product type: credits")
        print(f"   Amount: $0.50")

        # Call the handler
        stripe_service.handle_checkout_completed(test_session, db)

        # Refresh the user to get updated data
        db.refresh(user)

        print(f"\n✅ Test completed!")
        print(f"Final credits: {user.credits}")

        # Test subscription update
        print("\n=== Testing Subscription Update ===\n")

        test_session_subscription = {
            "id": "cs_test_789012",
            "metadata": {
                "user_id": str(user.id),
                "product_type": "basic",
                "environment": "development"
            },
            "amount_total": 50,  # $0.50 in cents
            "currency": "usd",
            "payment_status": "paid"
        }

        print("📋 Simulating checkout.session.completed event for subscription...")
        print(f"   Product type: basic")
        print(f"   Amount: $0.50")

        # Call the handler
        stripe_service.handle_checkout_completed(test_session_subscription, db)

        # Refresh the user to get updated data
        db.refresh(user)

        print(f"\n✅ Test completed!")
        print(f"Final plan: {user.subscription_plan}")
        print(f"Final status: {user.subscription_status}")

    except Exception as e:
        print(f"❌ Error during test: {str(e)}")
        print(f"   Exception type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        print("\n=== Test Finished ===\n")

if __name__ == "__main__":
    test_credit_addition()