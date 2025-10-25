#!/usr/bin/env python3
"""Check the last script generation for wepickthis@gmail.com"""
import psycopg2

conn = psycopg2.connect(
    host="23.95.254.67",
    port=5432,
    database="aivideo_prod",
    user="aivideo_user",
    password="aivideo2025"
)

cursor = conn.cursor()

email = 'wepickthis@gmail.com'

# Get user
cursor.execute("SELECT id, email, credits, is_new_user FROM users WHERE email = %s", (email,))
user = cursor.fetchone()

if not user:
    print(f"❌ User not found: {email}")
    exit(1)

user_id, user_email, credits, is_new_user = user

print("\n" + "=" * 100)
print(f"🔍 Last Script Generation Analysis for: {user_email}")
print("=" * 100)
print(f"Current Status:")
print(f"  - User ID: {user_id}")
print(f"  - Credits: {credits}")
print(f"  - is_new_user: {is_new_user}")
print()

# Get last uploaded image (script generation indicator)
print("📸 Last Uploaded Image (Most Recent Script Generation):")
print("-" * 100)
cursor.execute("""
    SELECT id, filename, file_size, created_at
    FROM uploaded_images
    WHERE user_id = %s
    ORDER BY created_at DESC
    LIMIT 1
""", (user_id,))

last_image = cursor.fetchone()

if last_image:
    img_id, filename, file_size, created_at = last_image
    print(f"  ID:         {img_id}")
    print(f"  Filename:   {filename}")
    print(f"  Size:       {file_size / 1024:.1f} KB")
    print(f"  Uploaded:   {created_at}")
    print()

    # Check if there was a video generated after this image upload
    cursor.execute("""
        SELECT id, model, duration, status, created_at
        FROM videos
        WHERE user_id = %s AND created_at > %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (user_id, created_at))

    video_after = cursor.fetchone()

    if video_after:
        vid_id, model, duration, status, vid_created = video_after
        print(f"📹 Video Generated After This Upload:")
        print(f"  Video ID:   {vid_id}")
        print(f"  Model:      {model}")
        print(f"  Duration:   {duration}s")
        print(f"  Status:     {status}")
        print(f"  Created:    {vid_created}")
        print(f"  Time diff:  {(vid_created - created_at).total_seconds():.1f} seconds after upload")
    else:
        print(f"📹 No video generated after this image upload")
        print(f"  ⚠️  This suggests script generation may have failed or user didn't click generate")
else:
    print("  No images uploaded")

print()

# Calculate expected credits based on all activity
cursor.execute("SELECT COUNT(*) FROM uploaded_images WHERE user_id = %s", (user_id,))
total_images = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*), SUM(CASE WHEN duration=4 THEN 40 WHEN duration=8 THEN 80 WHEN duration=12 THEN 120 ELSE 80 END) FROM videos WHERE user_id = %s", (user_id,))
total_videos, total_video_credits = cursor.fetchone()
total_video_credits = total_video_credits or 0

print("💡 Credit Calculation Check:")
print("-" * 100)
print(f"  Total images uploaded:        {total_images}")
print(f"  Expected script credits:      {total_images} × 10 = {total_images * 10}")
print(f"  Total videos generated:       {total_videos}")
print(f"  Total video credits used:     {total_video_credits}")
print()
print(f"  Expected total cost:          {total_images * 10 + total_video_credits}")
print(f"  Initial credits (assumed):    5000")
print(f"  Expected remaining:           {5000 - (total_images * 10 + total_video_credits)}")
print(f"  Actual remaining:             {credits}")
print(f"  Difference:                   {credits - (5000 - (total_images * 10 + total_video_credits))}")
print()

if credits > (5000 - (total_images * 10 + total_video_credits)):
    missing = credits - (5000 - (total_images * 10 + total_video_credits))
    print(f"⚠️  User has {missing} MORE credits than expected")
    print(f"   Possible causes:")
    print(f"   1. Script generation credits were NOT deducted ({total_images} scripts × 10 = {total_images * 10} credits)")
    print(f"   2. Initial credits were higher than 5000")
    print(f"   3. Credits were added manually")
elif credits < (5000 - (total_images * 10 + total_video_credits)):
    missing = (5000 - (total_images * 10 + total_video_credits)) - credits
    print(f"⚠️  User has {missing} FEWER credits than expected")
    print(f"   Possible cause: Extra charges or initial credits different")
else:
    print("✅ Credits balance matches expected calculation!")

print("=" * 100 + "\n")

cursor.close()
conn.close()
