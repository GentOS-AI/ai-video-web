#!/usr/bin/env python3
"""
SQLite to PostgreSQL Migration Script

Migrates data from SQLite database to PostgreSQL database.
Preserves all relationships and data integrity.

Usage:
    python scripts/migrate_sqlite_to_postgres.py

Requirements:
    1. PostgreSQL database must be created
    2. Set environment variables:
       - SQLITE_DB_PATH (optional, defaults to ./aivideo.db)
       - POSTGRES_URL (required, e.g., postgresql://user:pass@localhost/dbname)

Author: AI Video DIY Team
Date: 2025-10-24
"""

import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, MetaData, Table, select, inspect, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import IntegrityError


# Configuration
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./aivideo.db")
POSTGRES_URL = os.getenv("POSTGRES_URL", "")

# Color codes for terminal output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
RESET = "\033[0m"


def print_header(message: str):
    """Print formatted header"""
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}{message:^70}{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")


def print_success(message: str):
    """Print success message"""
    print(f"{GREEN}✅ {message}{RESET}")


def print_warning(message: str):
    """Print warning message"""
    print(f"{YELLOW}⚠️  {message}{RESET}")


def print_error(message: str):
    """Print error message"""
    print(f"{RED}❌ {message}{RESET}")


def print_info(message: str):
    """Print info message"""
    print(f"{BLUE}ℹ️  {message}{RESET}")


def validate_config() -> tuple[str, str]:
    """Validate configuration and return database URLs"""
    print_header("Configuration Validation")

    # Check SQLite database
    if not os.path.exists(SQLITE_DB_PATH):
        print_error(f"SQLite database not found: {SQLITE_DB_PATH}")
        sys.exit(1)

    sqlite_size = os.path.getsize(SQLITE_DB_PATH) / 1024  # KB
    print_success(f"SQLite database found: {SQLITE_DB_PATH} ({sqlite_size:.2f} KB)")

    # Check PostgreSQL URL
    if not POSTGRES_URL:
        print_error("POSTGRES_URL environment variable not set")
        print_info("Example: export POSTGRES_URL='postgresql://user:pass@localhost/dbname'")
        sys.exit(1)

    # Mask password in URL for display
    masked_url = POSTGRES_URL
    if "@" in masked_url:
        parts = masked_url.split("@")
        if ":" in parts[0]:
            user_pass = parts[0].split(":")
            masked_url = f"{user_pass[0]}:****@{parts[1]}"

    print_success(f"PostgreSQL URL: {masked_url}")

    sqlite_url = f"sqlite:///{SQLITE_DB_PATH}"
    return sqlite_url, POSTGRES_URL


def test_connections(sqlite_url: str, postgres_url: str) -> tuple[Any, Any]:
    """Test database connections"""
    print_header("Testing Database Connections")

    try:
        # Test SQLite connection
        sqlite_engine = create_engine(sqlite_url)
        with sqlite_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                print_success("SQLite connection successful")
    except Exception as e:
        print_error(f"SQLite connection failed: {e}")
        sys.exit(1)

    try:
        # Test PostgreSQL connection
        postgres_engine = create_engine(postgres_url)
        with postgres_engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            if result == 1:
                print_success("PostgreSQL connection successful")
    except Exception as e:
        print_error(f"PostgreSQL connection failed: {e}")
        print_info("Make sure PostgreSQL database exists and credentials are correct")
        sys.exit(1)

    return sqlite_engine, postgres_engine


def get_table_order() -> List[str]:
    """
    Return tables in correct order for migration (respecting foreign keys)
    Parent tables must be migrated before child tables
    """
    return [
        "users",              # No dependencies
        "trial_images",       # No dependencies
        "showcase_videos",    # No dependencies
        "videos",             # Depends on users
        "uploaded_images",    # Depends on users
        "enhancement_tasks",  # Depends on users
    ]


def migrate_table(
    table_name: str,
    sqlite_session: Session,
    postgres_session: Session,
    sqlite_metadata: MetaData,
    postgres_metadata: MetaData,
) -> tuple[int, int]:
    """
    Migrate a single table from SQLite to PostgreSQL

    Returns:
        (success_count, error_count) tuple
    """
    print_info(f"Migrating table: {table_name}")

    # Get table definition
    try:
        sqlite_table = Table(table_name, sqlite_metadata, autoload_with=sqlite_session.bind)
        postgres_table = Table(table_name, postgres_metadata, autoload_with=postgres_session.bind)
    except Exception as e:
        print_warning(f"Table {table_name} not found in source or target: {e}")
        return 0, 0

    # Get all rows from SQLite
    select_stmt = select(sqlite_table)
    rows = sqlite_session.execute(select_stmt).fetchall()

    if not rows:
        print_warning(f"  No data in {table_name}")
        return 0, 0

    # Insert rows into PostgreSQL
    success_count = 0
    error_count = 0

    for row in rows:
        try:
            # Convert row to dict
            row_dict = dict(row._mapping)

            # Filter out columns that don't exist in target table
            target_columns = {col.name for col in postgres_table.columns}
            filtered_dict = {k: v for k, v in row_dict.items() if k in target_columns}

            # Insert into PostgreSQL
            insert_stmt = postgres_table.insert().values(**filtered_dict)
            postgres_session.execute(insert_stmt)
            postgres_session.commit()
            success_count += 1

        except IntegrityError as e:
            # Skip if record already exists (duplicate key)
            postgres_session.rollback()
            error_count += 1
            if "duplicate key" not in str(e).lower():
                print_warning(f"  Integrity error for record: {e}")

        except Exception as e:
            postgres_session.rollback()
            error_count += 1
            print_error(f"  Error migrating record: {e}")

    if success_count > 0:
        print_success(f"  Migrated {success_count} rows to {table_name}")
    if error_count > 0:
        print_warning(f"  Skipped {error_count} rows (likely duplicates)")

    return success_count, error_count


def reset_sequences(postgres_engine: Any, tables: List[str]):
    """
    Reset PostgreSQL sequences to max(id) + 1 for each table
    This ensures auto-increment works correctly after migration
    """
    print_header("Resetting PostgreSQL Sequences")

    inspector = inspect(postgres_engine)

    for table_name in tables:
        try:
            # Check if table has a primary key
            pk_columns = inspector.get_pk_constraint(table_name)
            if not pk_columns or not pk_columns.get("constrained_columns"):
                continue

            pk_column = pk_columns["constrained_columns"][0]

            # Get max ID
            with postgres_engine.connect() as conn:
                result = conn.execute(text(f"SELECT MAX({pk_column}) FROM {table_name}"))
                max_id = result.scalar()

                if max_id is not None:
                    # Reset sequence
                    sequence_name = f"{table_name}_{pk_column}_seq"
                    conn.execute(text(f"SELECT setval('{sequence_name}', {max_id})"))
                    conn.commit()
                    print_success(f"Reset sequence for {table_name} to {max_id + 1}")

        except Exception as e:
            print_warning(f"Could not reset sequence for {table_name}: {e}")


def verify_migration(sqlite_engine: Any, postgres_engine: Any, tables: List[str]):
    """Verify data migration by comparing row counts"""
    print_header("Verifying Migration")

    all_match = True

    for table_name in tables:
        try:
            # Count rows in SQLite
            with sqlite_engine.connect() as conn:
                sqlite_count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()

            # Count rows in PostgreSQL
            with postgres_engine.connect() as conn:
                postgres_count = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}")).scalar()

            # Compare
            if sqlite_count == postgres_count:
                print_success(f"{table_name}: {postgres_count} rows (✓ match)")
            else:
                print_warning(f"{table_name}: SQLite={sqlite_count}, PostgreSQL={postgres_count} (✗ mismatch)")
                all_match = False

        except Exception as e:
            print_warning(f"Could not verify {table_name}: {e}")

    return all_match


def main():
    """Main migration function"""
    print_header("🚀 SQLite to PostgreSQL Migration Tool")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # Step 1: Validate configuration
    sqlite_url, postgres_url = validate_config()

    # Step 2: Test connections
    sqlite_engine, postgres_engine = test_connections(sqlite_url, postgres_url)

    # Step 3: Create sessions
    print_header("Creating Database Sessions")
    SQLiteSession = sessionmaker(bind=sqlite_engine)
    PostgresSession = sessionmaker(bind=postgres_engine)

    sqlite_session = SQLiteSession()
    postgres_session = PostgresSession()

    sqlite_metadata = MetaData()
    postgres_metadata = MetaData()

    print_success("Sessions created")

    # Step 4: Migrate tables
    print_header("Migrating Data")
    tables_to_migrate = get_table_order()

    total_success = 0
    total_errors = 0

    for table_name in tables_to_migrate:
        success, errors = migrate_table(
            table_name,
            sqlite_session,
            postgres_session,
            sqlite_metadata,
            postgres_metadata,
        )
        total_success += success
        total_errors += errors

    # Step 5: Reset sequences
    reset_sequences(postgres_engine, tables_to_migrate)

    # Step 6: Verify migration
    all_match = verify_migration(sqlite_engine, postgres_engine, tables_to_migrate)

    # Step 7: Summary
    print_header("Migration Summary")
    print_success(f"Total rows migrated: {total_success}")
    if total_errors > 0:
        print_warning(f"Total errors/skipped: {total_errors}")

    if all_match:
        print_success("✅ All table row counts match - Migration successful!")
    else:
        print_warning("⚠️  Some tables have mismatched counts - Please verify manually")

    print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Cleanup
    sqlite_session.close()
    postgres_session.close()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\nMigration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nFatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
