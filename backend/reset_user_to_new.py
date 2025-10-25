#!/usr/bin/env python3
"""Reset user to new user status for testing"""
import sys
import psycopg2

email = sys.argv[1] if len(sys.argv) > 1 else 'wepickthis@gmail.com'

conn = psycopg2.connect(
    host="23.95.254.67",
    port=5432,
    database="aivideo_prod",
    user="aivideo_user",
    password="aivideo2025"
)

cursor = conn.cursor()

# Get current user status
cursor.execute("SELECT id, email, credits, is_new_user FROM users WHERE email = %s", (email,))
user = cursor.fetchone()

if not user:
    print(f"❌ User not found: {email}")
    sys.exit(1)

user_id, user_email, credits, is_new_user = user

print("\n" + "=" * 80)
print(f"🔄 Resetting user to NEW USER status: {user_email}")
print("=" * 80)
print(f"Current status:")
print(f"  User ID: {user_id}")
print(f"  Credits: {credits}")
print(f"  is_new_user: {is_new_user}")
print()

# Update to new user
cursor.execute("""
    UPDATE users
    SET is_new_user = TRUE, updated_at = NOW()
    WHERE id = %s
""", (user_id,))

conn.commit()

print(f"✅ Successfully reset to NEW USER status")
print(f"   is_new_user: True")
print()

# Verify
cursor.execute("SELECT is_new_user, updated_at FROM users WHERE id = %s", (user_id,))
result = cursor.fetchone()

print("Verified:")
print(f"  is_new_user: {result[0]}")
print(f"  updated_at: {result[1]}")
print("=" * 80 + "\n")

cursor.close()
conn.close()
