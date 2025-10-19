#!/usr/bin/env python3
"""
Test invalid webhook signature
"""
import json
import time
import requests

WEBHOOK_URL = "http://localhost:8000/api/v1/webhooks/stripe"

def test_invalid_signature():
    """Test with invalid signature"""

    # Create a test event
    event = {
        "id": f"evt_test_{int(time.time())}",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": f"cs_test_{int(time.time())}",
                "payment_status": "paid",
                "amount_total": 50,
                "currency": "usd",
                "customer_email": "test@example.com",
                "metadata": {
                    "user_id": "1",
                    "product_type": "credits",
                    "environment": "development"
                }
            }
        }
    }

    # Convert to JSON
    payload = json.dumps(event)

    # Use an invalid signature
    invalid_signature = "t=123456789,v1=invalid_signature_here"

    print(f"🚀 Sending webhook with INVALID signature")
    print(f"   URL: {WEBHOOK_URL}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "stripe-signature": invalid_signature
            }
        )

        print(f"\n📡 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")

        if response.status_code == 400:
            print("✅ Invalid signature correctly rejected!")
        else:
            print("❌ Unexpected response code!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

def test_missing_signature():
    """Test with missing signature header"""

    # Create a test event
    event = {
        "id": f"evt_test_{int(time.time())}",
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": f"cs_test_{int(time.time())}",
                "payment_status": "paid"
            }
        }
    }

    payload = json.dumps(event)

    print(f"\n🚀 Sending webhook WITHOUT signature header")
    print(f"   URL: {WEBHOOK_URL}")

    try:
        response = requests.post(
            WEBHOOK_URL,
            data=payload,
            headers={
                "Content-Type": "application/json"
                # No stripe-signature header
            }
        )

        print(f"\n📡 Response:")
        print(f"   Status: {response.status_code}")
        print(f"   Body: {response.text}")

        if response.status_code == 400:
            print("✅ Missing signature correctly rejected!")
        else:
            print("❌ Unexpected response code!")

    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    print("=== Testing Invalid Webhook Signatures ===\n")

    test_invalid_signature()
    test_missing_signature()

    print("\n=== Test Complete ===")