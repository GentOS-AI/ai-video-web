"""
Quick script to query user from PostgreSQL database
"""
import os

# Set DATABASE_URL from environment
os.environ['DATABASE_URL'] = 'postgresql://aivideo_user:aivideo2025@23.95.254.67:5432/aivideo_prod'

import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings

# Create engine with PostgreSQL URL
engine = create_engine(settings.DATABASE_URL)

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT id, email, name, credits, is_new_user, subscription_plan, subscription_status, created_at
        FROM users
        WHERE email = :email
    """), {"email": "meiduan.f@gmail.com"})

    user = result.fetchone()

    if user:
        print("\n" + "=" * 100)
        print("📋 User Information: meiduan.f@gmail.com")
        print("=" * 100)
        print(f"ID: {user[0]}")
        print(f"Email: {user[1]}")
        print(f"Name: {user[2]}")
        print(f"Credits: {user[3]}")
        print(f"is_new_user: {user[4]}")
        print(f"Subscription Plan: {user[5]}")
        print(f"Subscription Status: {user[6]}")
        print(f"Created At: {user[7]}")
        print("=" * 100)
    else:
        print("\n❌ User not found: meiduan.f@gmail.com")
