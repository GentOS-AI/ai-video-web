#!/usr/bin/env python3
"""
Test Stripe webhook locally
"""
import json
import hmac
import hashlib
import time
import requests

# Read webhook secret from environment
WEBHOOK_SECRET = "whsec_f16f0364587f74bcde0e498f0970ddaede7a2766a94190735dec76f6925ca37d"
WEBHOOK_URL = "http://localhost:8000/api/v1/webhooks/stripe"

def generate_signature(payload_string, secret):
    """Generate Stripe webhook signature"""
    timestamp = str(int(time.time()))
    signed_payload = f"{timestamp}.{payload_string}"

    # Compute HMAC using webhook secret
    signature = hmac.new(
        secret.encode('utf-8'),
        signed_payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    # Return the formatted signature header
    return f"t={timestamp},v1={signature}"

def test_credit_purchase(user_id=1):
    """Test credit purchase webhook"""

    # Create a test checkout.session.completed event for credits
    event = {
        "id": f"evt_test_{int(time.time())}",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": f"cs_test_{int(time.time())}",
                "payment_status": "paid",
                "amount_total": 50,  # $0.50 in cents
                "currency": "usd",
                "customer_email": "test@example.com",
                "metadata": {
                    "user_id": str(user_id),
                    "product_type": "credits",
                    "environment": "development"
                }
            }
        }
    }

    # Convert to JSON
    payload = json.dumps(event)

    # Generate signature
    signature = generate_signature(payload, WEBHOOK_SECRET)

    # Send webhook request
    print(f"\n🚀 Sending webhook to {WEBHOOK_URL}")
    print(f"   Event type: checkout.session.completed")
    print(f"   Product: credits")
    print(f"   User ID: {user_id}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "stripe-signature": signature
            }
        )

        print(f"\n📡 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")

        if response.status_code == 200:
            print("✅ Webhook processed successfully!")
        else:
            print("❌ Webhook failed!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_subscription_purchase(user_id=1, plan="basic"):
    """Test subscription purchase webhook"""

    # Create a test checkout.session.completed event for subscription
    event = {
        "id": f"evt_test_{int(time.time())}",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": f"cs_test_{int(time.time())}",
                "payment_status": "paid",
                "amount_total": 50 if plan == "basic" else 100,  # cents
                "currency": "usd",
                "customer_email": "test@example.com",
                "metadata": {
                    "user_id": str(user_id),
                    "product_type": plan,
                    "environment": "development"
                }
            }
        }
    }

    # Convert to JSON
    payload = json.dumps(event)

    # Generate signature
    signature = generate_signature(payload, WEBHOOK_SECRET)

    # Send webhook request
    print(f"\n🚀 Sending webhook to {WEBHOOK_URL}")
    print(f"   Event type: checkout.session.completed")
    print(f"   Product: {plan}")
    print(f"   User ID: {user_id}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "stripe-signature": signature
            }
        )

        print(f"\n📡 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")

        if response.status_code == 200:
            print("✅ Webhook processed successfully!")
        else:
            print("❌ Webhook failed!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("=== Stripe Webhook Test ===\n")

    # Test with user ID 1 (make sure this user exists)
    user_id = input("Enter user ID to test with (default: 1): ").strip() or "1"

    print("\n1. Test credit purchase")
    print("2. Test basic subscription")
    print("3. Test pro subscription")
    choice = input("\nChoose test (1-3): ").strip()

    if choice == "1":
        test_credit_purchase(user_id)
    elif choice == "2":
        test_subscription_purchase(user_id, "basic")
    elif choice == "3":
        test_subscription_purchase(user_id, "pro")
    else:
        print("Invalid choice")

    print("\n=== Test Complete ===\n")