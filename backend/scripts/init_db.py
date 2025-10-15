"""
Initialize database - Create all tables
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import engine, Base
from app.models import User, Video, ShowcaseVideo, TrialImage


def init_database():
    """Create all database tables"""
    print("Creating database tables...")

    # Import all models to ensure they're registered with Base
    # This is already done by importing above

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("✅ Database tables created successfully!")
    print("\nCreated tables:")
    for table in Base.metadata.sorted_tables:
        print(f"  - {table.name}")


if __name__ == "__main__":
    init_database()
