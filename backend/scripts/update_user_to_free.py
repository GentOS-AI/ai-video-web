"""
Script to update user subscription plan to free level
Usage: python scripts/update_user_to_free.py [user_id or email]
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User


def update_user_to_free(identifier: str):
    """
    Update user subscription plan to free level

    Args:
        identifier: User ID (integer) or email (string)
    """
    db: Session = SessionLocal()

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

        # Update to free plan
        user.subscription_plan = "free"
        user.subscription_status = "active"
        user.subscription_start_date = None
        user.subscription_end_date = None

        db.commit()

        print(f"\n✅ Successfully updated user to FREE level!")
        print(f"   New Plan: {user.subscription_plan}")
        print(f"   New Status: {user.subscription_status}")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error updating user: {e}")
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
        print("-" * 80)
        for user in users:
            print(f"ID: {user.id:3d} | Email: {user.email:30s} | Plan: {user.subscription_plan:8s} | Credits: {user.credits:6.1f}")
        print("-" * 80)

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 80)
    print("🔧 User Subscription Plan Updater - Set to FREE Level")
    print("=" * 80)

    if len(sys.argv) < 2:
        print("\n📋 Usage:")
        print("   python scripts/update_user_to_free.py <user_id or email>")
        print("   python scripts/update_user_to_free.py --list   (list all users)")
        print("\nExamples:")
        print("   python scripts/update_user_to_free.py 1")
        print("   python scripts/update_user_to_free.py user@example.com")
        print("   python scripts/update_user_to_free.py --list")
        sys.exit(1)

    identifier = sys.argv[1]

    if identifier == "--list":
        list_all_users()
    else:
        update_user_to_free(identifier)

    print("\n" + "=" * 80)
