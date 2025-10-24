"""
Script to update user subscription plan
Usage: python scripts/update_subscription.py <user_id or email> <plan>
Plans: free, basic, premium
"""
import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User


def update_subscription(identifier: str, plan: str):
    """
    Update user subscription plan

    Args:
        identifier: User ID (integer) or email (string)
        plan: Subscription plan (free, basic, premium)
    """
    db: Session = SessionLocal()

    # Validate plan
    valid_plans = ["free", "basic", "premium"]
    if plan.lower() not in valid_plans:
        print(f"❌ Invalid plan: {plan}")
        print(f"   Valid plans: {', '.join(valid_plans)}")
        return False

    plan = plan.lower()

    try:
        # Try to find user by ID first, then by email
        user = None
        try:
            user_id = int(identifier)
            user = db.query(User).filter(User.id == user_id).first()
        except ValueError:
            # Not an integer, try email
            user = db.query(User).filter(User.email == identifier).first()

        if not user:
            print(f"❌ User not found: {identifier}")
            return False

        # Display current user info
        print(f"\n📋 Current User Info:")
        print(f"   ID: {user.id}")
        print(f"   Email: {user.email}")
        print(f"   Name: {user.name}")
        print(f"   Current Plan: {user.subscription_plan}")
        print(f"   Current Status: {user.subscription_status}")
        print(f"   Credits: {user.credits}")
        if user.subscription_start_date:
            print(f"   Start Date: {user.subscription_start_date}")
        if user.subscription_end_date:
            print(f"   End Date: {user.subscription_end_date}")

        # Update subscription
        old_plan = user.subscription_plan
        user.subscription_plan = plan
        user.subscription_status = "active"

        # Set dates based on plan
        if plan == "free":
            user.subscription_start_date = None
            user.subscription_end_date = None
        else:
            # For paid plans, set 30 days subscription
            user.subscription_start_date = datetime.utcnow()
            user.subscription_end_date = datetime.utcnow() + timedelta(days=30)

        db.commit()

        print(f"\n✅ Successfully updated subscription!")
        print(f"   Old Plan: {old_plan}")
        print(f"   New Plan: {user.subscription_plan}")
        print(f"   Status: {user.subscription_status}")
        if user.subscription_start_date:
            print(f"   Start Date: {user.subscription_start_date.strftime('%Y-%m-%d %H:%M:%S')}")
        if user.subscription_end_date:
            print(f"   End Date: {user.subscription_end_date.strftime('%Y-%m-%d %H:%M:%S')}")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error updating subscription: {e}")
        import traceback
        traceback.print_exc()
        return False

    finally:
        db.close()


def list_all_users():
    """List all users in the database"""
    db: Session = SessionLocal()

    try:
        users = db.query(User).all()

        if not users:
            print("No users found in database.")
            return

        print(f"\n📋 All Users ({len(users)} total):")
        print("-" * 120)
        print(f"{'ID':>4} | {'Email':<35} | {'Plan':<10} | {'Status':<10} | {'Credits':>10} | {'End Date':<20}")
        print("-" * 120)
        for user in users:
            end_date = user.subscription_end_date.strftime('%Y-%m-%d') if user.subscription_end_date else 'N/A'
            print(f"{user.id:>4} | {user.email:<35} | {user.subscription_plan:<10} | {user.subscription_status:<10} | {user.credits:>10.1f} | {end_date:<20}")
        print("-" * 120)

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 120)
    print("🔧 User Subscription Manager")
    print("=" * 120)

    if len(sys.argv) < 2:
        print("\n📋 Usage:")
        print("   python scripts/update_subscription.py <user_id or email> <plan>")
        print("   python scripts/update_subscription.py --list   (list all users)")
        print("\n📦 Available Plans:")
        print("   - free:    Free plan (no subscription)")
        print("   - basic:   Basic plan (30 days)")
        print("   - premium: Premium plan (30 days)")
        print("\n📝 Examples:")
        print("   python scripts/update_subscription.py 1 basic")
        print("   python scripts/update_subscription.py user@example.com premium")
        print("   python scripts/update_subscription.py meiduan.f@gmail.com basic")
        print("   python scripts/update_subscription.py --list")
        sys.exit(1)

    if sys.argv[1] == "--list":
        list_all_users()
    elif len(sys.argv) < 3:
        print("❌ Error: Please provide both user identifier and plan")
        print("   Usage: python scripts/update_subscription.py <user_id or email> <plan>")
        print("   Plans: free, basic, premium")
        sys.exit(1)
    else:
        identifier = sys.argv[1]
        plan = sys.argv[2]
        update_subscription(identifier, plan)

    print("\n" + "=" * 120)
