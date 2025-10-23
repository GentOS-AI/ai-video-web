"""
Database migration script to add is_new_user field to users table
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.database import engine, SessionLocal
from app.models.user import User

def add_is_new_user_field():
    """Add is_new_user column to users table"""

    print("=" * 80)
    print("🔧 Database Migration: Adding is_new_user field to users table")
    print("=" * 80)

    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]

            if 'is_new_user' in columns:
                print("✅ Column 'is_new_user' already exists. No migration needed.")
                return True

            # Add the column with default value True
            print("\n📝 Adding 'is_new_user' column to users table...")
            conn.execute(text("ALTER TABLE users ADD COLUMN is_new_user BOOLEAN DEFAULT 1"))
            conn.commit()

            print("✅ Successfully added 'is_new_user' column!")

            # Update existing users: set is_new_user to False if they have generated videos
            print("\n📝 Updating existing users...")
            db = SessionLocal()
            try:
                users = db.query(User).all()
                for user in users:
                    # Check if user has any videos
                    has_videos = len(user.videos) > 0
                    user.is_new_user = not has_videos
                    print(f"   User {user.email}: is_new_user = {user.is_new_user} (has {len(user.videos)} videos)")

                db.commit()
                print(f"\n✅ Updated {len(users)} users successfully!")
            finally:
                db.close()

            return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False

    finally:
        print("\n" + "=" * 80)

if __name__ == "__main__":
    success = add_is_new_user_field()
    sys.exit(0 if success else 1)
