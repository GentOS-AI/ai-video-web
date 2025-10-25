#!/usr/bin/env python3
"""
Quick script to check user status in PostgreSQL database
Usage: python check_user.py <email>
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def check_user(email: str):
    """Check user status from database"""
    try:
        from sqlalchemy import create_engine, text

        # Get DATABASE_URL from .env
        from dotenv import load_dotenv
        load_dotenv()

        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            print("❌ DATABASE_URL not found in .env")
            return

        print(f"\n🔍 Connecting to database...")
        print(f"   URL: {database_url.split('@')[1] if '@' in database_url else 'local'}")

        engine = create_engine(database_url)

        with engine.connect() as conn:
            result = conn.execute(
                text("""
                    SELECT
                        id,
                        email,
                        name,
                        credits,
                        is_new_user,
                        subscription_plan,
                        subscription_status,
                        created_at,
                        updated_at
                    FROM users
                    WHERE email = :email
                """),
                {"email": email}
            )

            user = result.fetchone()

            if user:
                print("\n" + "=" * 100)
                print(f"📋 User Information: {email}")
                print("=" * 100)
                print(f"  ID:                  {user[0]}")
                print(f"  Email:               {user[1]}")
                print(f"  Name:                {user[2] or 'N/A'}")
                print(f"  Credits:             {user[3]} ⭐")
                print(f"  is_new_user:         {user[4]} {'🆕 (NEW USER)' if user[4] else '✅ (EXISTING USER)'}")
                print(f"  Subscription Plan:   {user[5]}")
                print(f"  Subscription Status: {user[6]}")
                print(f"  Created At:          {user[7]}")
                print(f"  Updated At:          {user[8]}")
                print("=" * 100)

                # Check videos count
                video_result = conn.execute(
                    text("SELECT COUNT(*) FROM videos WHERE user_id = :user_id"),
                    {"user_id": user[0]}
                )
                video_count = video_result.scalar()

                print(f"\n📹 Videos Generated: {video_count}")

                # Analysis
                print("\n🔍 Analysis:")
                if user[4]:  # is_new_user is True
                    print("   ⚠️  User is marked as NEW USER in database")
                    print("   ➡️  Generate button will show: 'Try for Free'")
                    print(f"   ➡️  User has generated {video_count} videos")
                    if video_count > 0:
                        print("   💡 Recommendation: User should be marked as existing user (is_new_user=False)")
                else:
                    print("   ✅ User is marked as EXISTING USER in database")
                    print("   ➡️  Generate button will show: 'All-In-One Generate'")

                print("=" * 100)

            else:
                print(f"\n❌ User not found: {email}")
                print("=" * 100)

    except ImportError as e:
        print(f"\n❌ Missing dependency: {e}")
        print("   Install with: pip install python-dotenv psycopg2-binary")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python check_user.py <email>")
        print("Example: python check_user.py meiduan.f@gmail.com")
        sys.exit(1)

    email = sys.argv[1]
    check_user(email)
