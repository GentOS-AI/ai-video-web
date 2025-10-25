"""
Database Migration Script: Add Subscription Fields to Users Table

This script adds subscription-related fields to the users table.
Run this once to upgrade the existing database schema.

Usage:
    cd backend
    python scripts/add_subscription_fields.py
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import sqlite3
from datetime import datetime, timedelta

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'aivideo.db')

def add_subscription_fields():
    """Add subscription fields to users table"""

    print("="*60)
    print("📦 Database Migration: Add Subscription Fields")
    print("="*60)
    print()

    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if fields already exist
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]

        fields_to_add = [
            ("subscription_plan", "VARCHAR(50) DEFAULT 'free'"),
            ("subscription_status", "VARCHAR(20) DEFAULT 'active'"),
            ("subscription_start_date", "DATETIME"),
            ("subscription_end_date", "DATETIME"),
        ]

        # Add each field if it doesn't exist
        for field_name, field_type in fields_to_add:
            if field_name not in columns:
                print(f"✅ Adding field: {field_name}")
                cursor.execute(f"ALTER TABLE users ADD COLUMN {field_name} {field_type}")
            else:
                print(f"⏭️  Field already exists: {field_name}")

        # Commit changes
        conn.commit()
        print()
        print("✅ Migration completed successfully!")
        print()

        # Show updated table structure
        cursor.execute("PRAGMA table_info(users)")
        print("📋 Updated users table structure:")
        for column in cursor.fetchall():
            print(f"   - {column[1]} ({column[2]})")

        print()
        print("="*60)

    except Exception as e:
        conn.rollback()
        print(f"❌ Error during migration: {e}")
        raise

    finally:
        conn.close()


def upgrade_test_user():
    """Upgrade meiduan.f@gmail.com to Pro subscription"""

    print()
    print("="*60)
    print("👤 Upgrading Test User to Pro Subscription")
    print("="*60)
    print()

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if user exists
        cursor.execute("SELECT id, email, credits FROM users WHERE email = ?", ('meiduan.f@gmail.com',))
        user = cursor.fetchone()

        if not user:
            print("⚠️  User meiduan.f@gmail.com not found. Skipping upgrade.")
            return

        user_id, email, old_credits = user
        print(f"📧 Found user: {email} (ID: {user_id})")
        print(f"   Current credits: {old_credits}")
        print()

        # Calculate dates
        start_date = datetime.utcnow()
        end_date = start_date + timedelta(days=30)  # 30 days from now

        # Upgrade to Pro
        cursor.execute("""
            UPDATE users
            SET
                subscription_plan = 'pro',
                subscription_status = 'active',
                subscription_start_date = ?,
                subscription_end_date = ?,
                credits = 500.0
            WHERE id = ?
        """, (start_date.isoformat(), end_date.isoformat(), user_id))

        conn.commit()

        # Verify update
        cursor.execute("SELECT subscription_plan, subscription_status, credits, subscription_end_date FROM users WHERE id = ?", (user_id,))
        updated_user = cursor.fetchone()

        print("✅ User upgraded successfully!")
        print()
        print(f"📊 New subscription details:")
        print(f"   Plan: {updated_user[0]}")
        print(f"   Status: {updated_user[1]}")
        print(f"   Credits: {updated_user[2]}")
        print(f"   Valid until: {updated_user[3]}")
        print()
        print("="*60)

    except Exception as e:
        conn.rollback()
        print(f"❌ Error upgrading user: {e}")
        raise

    finally:
        conn.close()


if __name__ == "__main__":
    print()
    print("🚀 Starting database migration...")
    print()

    # Step 1: Add fields
    add_subscription_fields()

    # Step 2: Upgrade test user
    upgrade_test_user()

    print()
    print("🎉 All migrations completed!")
    print()
