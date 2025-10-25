#!/usr/bin/env python3
"""
Fix user is_new_user status
Usage: python fix_user_status.py <email>
"""
import sys
import psycopg2

def fix_user_status(email: str):
    """Fix user is_new_user status"""
    try:
        conn = psycopg2.connect(
            host="23.95.254.67",
            port=5432,
            database="aivideo_prod",
            user="aivideo_user",
            password="aivideo2025"
        )

        cursor = conn.cursor()

        # Check current status
        cursor.execute("""
            SELECT id, email, is_new_user
            FROM users
            WHERE email = %s
        """, (email,))

        user = cursor.fetchone()

        if not user:
            print(f"\n❌ User not found: {email}\n")
            return False

        user_id, user_email, is_new_user = user

        print("\n" + "=" * 80)
        print(f"🔧 Fixing user status: {user_email}")
        print("=" * 80)
        print(f"  User ID: {user_id}")
        print(f"  Current is_new_user: {is_new_user}")

        if not is_new_user:
            print(f"\n✅ User is already marked as existing user. No change needed.")
            print("=" * 80 + "\n")
            return True

        # Check if user has videos
        cursor.execute("SELECT COUNT(*) FROM videos WHERE user_id = %s", (user_id,))
        video_count = cursor.fetchone()[0]

        print(f"  Videos generated: {video_count}")

        if video_count > 0:
            # Update is_new_user to False
            cursor.execute("""
                UPDATE users
                SET is_new_user = FALSE, updated_at = NOW()
                WHERE id = %s
            """, (user_id,))

            conn.commit()

            print(f"\n✅ Successfully updated is_new_user to FALSE")
            print(f"   Reason: User has already generated {video_count} videos")
            print("\n🎯 Result:")
            print(f"   - Generate button will now show: 'All-In-One Generate'")
            print(f"   - User is no longer in trial mode")
        else:
            print(f"\n⚠️  User has 0 videos, keeping is_new_user = TRUE")

        print("=" * 80 + "\n")

        cursor.close()
        conn.close()

        return True

    except Exception as e:
        print(f"\n❌ Error: {e}\n")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_user_status.py <email>")
        print("Example: python fix_user_status.py meiduan.f@gmail.com")
        sys.exit(1)

    email = sys.argv[1]
    success = fix_user_status(email)
    sys.exit(0 if success else 1)
