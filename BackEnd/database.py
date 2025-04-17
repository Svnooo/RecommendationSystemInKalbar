from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL koneksi ke PostgreSQL dengan database arkanaya_db
SQLALCHEMY_DATABASE_URL = "postgresql://admin_user:admin12345@localhost:5432/arkanaya_db"


# Membuat engine dan session
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base untuk model SQLAlchemy
Base = declarative_base()
