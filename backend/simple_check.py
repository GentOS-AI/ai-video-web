#!/usr/bin/env python3
"""Simple user check without SQLAlchemy"""
import sys

try:
    import psycopg2
    from psycopg2 import sql

    # Database connection
    conn = psycopg2.connect(
        host="23.95.254.67",
        port=5432,
        database="aivideo_prod",
        user="aivideo_user",
        password="aivideo2025"
    )

    cursor = conn.cursor()

    # Query user
    email = sys.argv[1] if len(sys.argv) > 1 else 'meiduan.f@gmail.com'

    cursor.execute("""
        SELECT
            id, email, name, credits, is_new_user,
            subscription_plan, subscription_status,
            created_at, updated_at
        FROM users
        WHERE email = %s
    """, (email,))

    user = cursor.fetchone()

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

        # Check videos
        cursor.execute("SELECT COUNT(*) FROM videos WHERE user_id = %s", (user[0],))
        video_count = cursor.fetchone()[0]
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
        print("=" * 100 + "\n")
    else:
        print(f"\n❌ User not found: {email}\n")

    cursor.close()
    conn.close()

except ImportError:
    print("\n❌ psycopg2 not installed")
    print("   Install with: pip install psycopg2-binary\n")
except Exception as e:
    print(f"\n❌ Error: {e}\n")
