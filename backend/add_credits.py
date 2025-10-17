#!/usr/bin/env python3
"""
Script to add credits to a user or create a new user
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from sqlalchemy import inspect

def init_db():
    """Create all tables if they don't exist"""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created/verified")

def add_credits_to_user(email: str, credits_to_add: float):
    """Add credits to user, create user if doesn't exist"""
    db = SessionLocal()

    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()

        if user:
            # User exists - add credits
            old_credits = user.credits
            user.credits += credits_to_add
            db.commit()
            db.refresh(user)

            print(f"\n✅ Credits added successfully!")
            print(f"   User: {user.name or user.email}")
            print(f"   Email: {user.email}")
            print(f"   Old Credits: {old_credits}")
            print(f"   Added: +{credits_to_add}")
            print(f"   New Credits: {user.credits}")
            print(f"   Subscription: {user.subscription_plan} ({user.subscription_status})")
        else:
            # User doesn't exist - create new user
            print(f"\n⚠️  User {email} not found. Creating new user...")

            # Create new user with google_id = email (temporary)
            new_user = User(
                google_id=f"manual_{email}",  # Temporary google_id
                email=email,
                name=email.split('@')[0],  # Use email prefix as name
                credits=credits_to_add,
                subscription_plan="basic",  # Set to basic so they can generate videos
                subscription_status="active"
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

            print(f"\n✅ User created successfully!")
            print(f"   ID: {new_user.id}")
            print(f"   Email: {new_user.email}")
            print(f"   Name: {new_user.name}")
            print(f"   Credits: {new_user.credits}")
            print(f"   Subscription: {new_user.subscription_plan} ({new_user.subscription_status})")
            print(f"\n⚠️  Note: User needs to login with Google to link account")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def list_all_users():
    """List all users in database"""
    db = SessionLocal()

    try:
        users = db.query(User).all()

        if not users:
            print("\n📭 No users found in database")
            return

        print(f"\n📋 Total users: {len(users)}\n")
        print(f"{'ID':<5} {'Email':<30} {'Name':<20} {'Credits':<10} {'Plan':<10}")
        print("-" * 85)

        for user in users:
            print(f"{user.id:<5} {user.email:<30} {(user.name or 'N/A'):<20} {user.credits:<10.1f} {user.subscription_plan:<10}")

    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎬 AIVideo.DIY - User Credits Management")
    print("="*60)

    # Initialize database tables
    init_db()

    # Check if email and credits are provided
    if len(sys.argv) < 3:
        print("\n📖 Usage:")
        print(f"   python {sys.argv[0]} <email> <credits>")
        print(f"\nExample:")
        print(f"   python {sys.argv[0]} meduan.f@gmail.com 5000")
        print("\n💡 Or run without arguments to list all users:")
        print(f"   python {sys.argv[0]} list")

        # List all users if run without args
        if len(sys.argv) == 2 and sys.argv[1] == "list":
            list_all_users()
        else:
            list_all_users()

        sys.exit(0)

    email = sys.argv[1]

    try:
        credits = float(sys.argv[2])
    except ValueError:
        print(f"\n❌ Error: Credits must be a number")
        sys.exit(1)

    # Add credits
    add_credits_to_user(email, credits)

    print("\n" + "="*60 + "\n")
