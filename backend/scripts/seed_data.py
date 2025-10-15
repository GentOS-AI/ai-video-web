"""
Seed database with initial showcase videos and trial images
"""
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.showcase import ShowcaseVideo
from app.models.trial_image import TrialImage


def seed_showcase_videos(db):
    """Seed showcase videos"""
    print("Seeding showcase videos...")

    showcase_videos = [
        {
            "title": "Tech Product Launch",
            "description": "Sleek smartphone reveal with dynamic transitions",
            "category": "Product",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            "poster_url": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800&h=450&fit=crop",
            "is_featured": True,
            "order": 1,
        },
        {
            "title": "Fashion Brand Story",
            "description": "Elegant fashion collection with cinematic shots",
            "category": "Fashion",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            "poster_url": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=450&fit=crop",
            "is_featured": True,
            "order": 2,
        },
        {
            "title": "Food & Beverage Ad",
            "description": "Mouth-watering product shots with close-ups",
            "category": "F&B",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
            "poster_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=450&fit=crop",
            "is_featured": True,
            "order": 3,
        },
        {
            "title": "Real Estate Tour",
            "description": "Virtual property walkthrough with smooth pans",
            "category": "Real Estate",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
            "poster_url": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=450&fit=crop",
            "is_featured": False,
            "order": 4,
        },
        {
            "title": "Automotive Showcase",
            "description": "Luxury car presentation with dramatic lighting",
            "category": "Automotive",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
            "poster_url": "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=450&fit=crop",
            "is_featured": False,
            "order": 5,
        },
        {
            "title": "SaaS Platform Demo",
            "description": "Software interface animation with clean UI",
            "category": "Tech",
            "video_url": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
            "poster_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
            "is_featured": False,
            "order": 6,
        },
    ]

    for video_data in showcase_videos:
        # Check if already exists
        existing = db.query(ShowcaseVideo).filter(ShowcaseVideo.title == video_data["title"]).first()
        if not existing:
            video = ShowcaseVideo(**video_data)
            db.add(video)

    db.commit()
    print(f"✅ Seeded {len(showcase_videos)} showcase videos")


def seed_trial_images(db):
    """Seed trial images"""
    print("Seeding trial images...")

    trial_images = [
        {
            "title": "Tech Product",
            "image_url": "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
            "category": "Tech",
            "order": 1,
            "is_active": True,
        },
        {
            "title": "AI Technology",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
            "category": "AI",
            "order": 2,
            "is_active": True,
        },
        {
            "title": "Business Tech",
            "image_url": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=400&fit=crop",
            "category": "Business",
            "order": 3,
            "is_active": True,
        },
        {
            "title": "Modern Office",
            "image_url": "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=400&h=400&fit=crop",
            "category": "Office",
            "order": 4,
            "is_active": True,
        },
        {
            "title": "Data Analytics",
            "image_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
            "category": "Data",
            "order": 5,
            "is_active": True,
        },
        {
            "title": "Digital Marketing",
            "image_url": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=400&fit=crop",
            "category": "Marketing",
            "order": 6,
            "is_active": True,
        },
        {
            "title": "Team Meeting",
            "image_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=400&fit=crop",
            "category": "Business",
            "order": 7,
            "is_active": True,
        },
        {
            "title": "Presentation",
            "image_url": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop",
            "category": "Business",
            "order": 8,
            "is_active": True,
        },
    ]

    for image_data in trial_images:
        # Check if already exists
        existing = db.query(TrialImage).filter(TrialImage.title == image_data["title"]).first()
        if not existing:
            image = TrialImage(**image_data)
            db.add(image)

    db.commit()
    print(f"✅ Seeded {len(trial_images)} trial images")


def seed_database():
    """Seed database with initial data"""
    db = SessionLocal()

    try:
        print("🌱 Starting database seeding...\n")

        seed_showcase_videos(db)
        seed_trial_images(db)

        print("\n✅ Database seeding completed successfully!")

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
