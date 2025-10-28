import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Destination  # Ensure Base and Destination are imported correctly

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database URL
SQLALCHEMY_DATABASE_URL = "postgresql://admin_user:admin12345@localhost:5432/arkanaya_db"  # Adjust as needed

# Create the engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=True)

# Create sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Sample data for destinations
SAMPLE_DESTINATIONS = [
    {
        "title": "Bukit Kelam",
        "description": "Bukit Kelam is a promising tourist destination in West Kalimantan. Famous for its majestic rock formations and panoramic views.",
        "full_description": "Bukit Kelam is a monolithic rock and one of the most majestic natural wonders in West Kalimantan. Standing at approximately 900 meters above sea level, this massive black rock formation is often referred to as the \"Black Rock\" by locals.",
        "image_url": "/images/bukit-kelam.jpg",
        "is_featured": True
    },
    {
        "title": "Danau Sentarum",
        "description": "Danau Sentarum is a unique ecosystem of interconnected seasonal lakes in West Kalimantan, home to diverse wildlife and floating villages.",
        "full_description": "Danau Sentarum National Park is a unique wetland ecosystem located in West Kalimantan. This extraordinary natural wonder consists of a complex system of interconnected seasonal lakes, flooding forests, and peat swamp forests.",
        "image_url": "/images/danau-sentarum.jpg",
        "is_featured": False
    },
    {
        "title": "Tugu Khatulistiwa",
        "description": "Tugu Khatulistiwa is a monument that marks the equator line passing through Pontianak, making it a unique geographical landmark.",
        "full_description": "Tugu Khatulistiwa or the Equator Monument is a famous landmark located in Pontianak, West Kalimantan. This monument marks the exact spot where the equator line passes through, making it one of the few places in the world where you can stand with one foot in the northern hemisphere and the other in the southern hemisphere.",
        "image_url": "/images/tugu-khatulistiwa.jpg",
        "is_featured": False
    },
    {
        "title": "Tugu Digulis",
        "description": "Tugu Digulis is a historical monument that commemorates the struggle of West Kalimantan heroes against colonial powers.",
        "full_description": "Tugu Digulis is an important historical monument located in Pontianak, West Kalimantan. It was built to honor and commemorate the heroes of West Kalimantan who fought against colonial oppression. The monument stands as a symbol of the region's resilience and struggle for independence.",
        "image_url": "/images/tugu-digulis.jpg",
        "is_featured": False
    }
]

def init_db():
    db = SessionLocal()
    
    try:
        # Ensure the tables are created
        print("Creating tables if they do not exist...")
        Base.metadata.create_all(bind=engine)
        
        # Check if data already exists
        existing_count = db.query(Destination).count()
        if existing_count > 0:
            print(f"Database already has {existing_count} destinations. Skipping initialization.")
            return
        
        # Add sample destinations
        for dest_data in SAMPLE_DESTINATIONS:
            destination = Destination(**dest_data)
            db.add(destination)
        
        db.commit()
        print(f"Successfully added {len(SAMPLE_DESTINATIONS)} destinations to the database.")
    
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing database with sample data...")
    init_db()
    print("Done.")
