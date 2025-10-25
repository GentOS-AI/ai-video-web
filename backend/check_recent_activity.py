#!/usr/bin/env python3
"""Check recent script generation activity for user"""
import sys
import psycopg2
from datetime import datetime, timedelta

email = sys.argv[1] if len(sys.argv) > 1 else 'meiduan.f@gmail.com'

conn = psycopg2.connect(
    host="23.95.254.67",
    port=5432,
    database="aivideo_prod",
    user="aivideo_user",
    password="aivideo2025"
)

cursor = conn.cursor()

# Get user
cursor.execute("SELECT id, email, credits, is_new_user FROM users WHERE email = %s", (email,))
user = cursor.fetchone()

if not user:
    print(f"❌ User not found: {email}")
    sys.exit(1)

user_id, user_email, credits, is_new_user = user

print("\n" + "=" * 100)
print(f"📊 Recent Activity for: {user_email}")
print("=" * 100)
print(f"Current Status:")
print(f"  - Credits: {credits}")
print(f"  - is_new_user: {is_new_user}")
print()

# Check recent uploaded images (last 5)
print("📸 Recent Uploaded Images (Last 5):")
print("-" * 100)
cursor.execute("""
    SELECT id, filename, file_size, created_at
    FROM uploaded_images
    WHERE user_id = %s
    ORDER BY created_at DESC
    LIMIT 5
""", (user_id,))

images = cursor.fetchall()
if images:
    for img in images:
        print(f"  ID: {img[0]:>4} | {img[1]:<40} | {img[2]/1024:.1f}KB | {img[3]}")
else:
    print("  No images uploaded")

print()

# Check recent videos (last 5)
print("🎬 Recent Videos Generated (Last 5):")
print("-" * 100)
cursor.execute("""
    SELECT id, model, duration, status, created_at
    FROM videos
    WHERE user_id = %s
    ORDER BY created_at DESC
    LIMIT 5
""", (user_id,))

videos = cursor.fetchall()
if videos:
    for vid in videos:
        print(f"  ID: {vid[0]:>4} | {vid[1]:<12} | {vid[2]}s | {vid[3]:<10} | {vid[4]}")
else:
    print("  No videos generated")

print("=" * 100)

# Check for credit transactions in last 24 hours
cursor.execute("""
    SELECT credits, updated_at
    FROM users
    WHERE id = %s
""", (user_id,))

print("\n🔍 Analysis:")
print(f"  Current credits: {credits}")
print(f"  is_new_user: {is_new_user}")

if is_new_user and len(videos) > 0:
    print(f"\n⚠️  BUG DETECTED: User has {len(videos)} videos but is_new_user is still True!")
    print("  Expected: is_new_user should be False after first script generation")

cursor.close()
conn.close()
