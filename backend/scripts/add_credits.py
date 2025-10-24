"""
Script to add credits to a user account
Usage: python scripts/add_credits.py <user_id or email> <credits_amount>
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User


def add_credits(identifier: str, credits_amount: float):
    """
    Add credits to a user account

    Args:
        identifier: User ID (integer) or email (string)
        credits_amount: Amount of credits to add
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
        print(f"   Current Credits: {user.credits}")

        # Add credits
        old_credits = user.credits
        user.credits += credits_amount

        db.commit()

        print(f"\n✅ Successfully added {credits_amount} credits!")
        print(f"   Old Credits: {old_credits}")
        print(f"   New Credits: {user.credits}")
        print(f"   Added: +{credits_amount}")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error adding credits: {e}")
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
        print("-" * 100)
        print(f"{'ID':>4} | {'Email':<35} | {'Plan':<10} | {'Credits':>10} | {'Status':<10}")
        print("-" * 100)
        for user in users:
            print(f"{user.id:>4} | {user.email:<35} | {user.subscription_plan:<10} | {user.credits:>10.1f} | {user.subscription_status:<10}")
        print("-" * 100)

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 100)
    print("💰 User Credits Manager - Add Credits to Account")
    print("=" * 100)

    if len(sys.argv) < 2:
        print("\n📋 Usage:")
        print("   python scripts/add_credits.py <user_id or email> <credits_amount>")
        print("   python scripts/add_credits.py --list   (list all users)")
        print("\nExamples:")
        print("   python scripts/add_credits.py 1 5000")
        print("   python scripts/add_credits.py user@example.com 1000")
        print("   python scripts/add_credits.py wepickthis 5000")
        print("   python scripts/add_credits.py --list")
        sys.exit(1)

    if sys.argv[1] == "--list":
        list_all_users()
    elif len(sys.argv) < 3:
        print("❌ Error: Please provide both user identifier and credits amount")
        print("   Usage: python scripts/add_credits.py <user_id or email> <credits_amount>")
        sys.exit(1)
    else:
        identifier = sys.argv[1]
        try:
            credits_amount = float(sys.argv[2])
            if credits_amount <= 0:
                print("❌ Error: Credits amount must be positive")
                sys.exit(1)
            add_credits(identifier, credits_amount)
        except ValueError:
            print("❌ Error: Invalid credits amount. Please provide a number.")
            sys.exit(1)

    print("\n" + "=" * 100)
