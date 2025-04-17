from sqlalchemy.orm import Session
import models
from passlib.context import CryptContext

# Menggunakan bcrypt untuk hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, username: str, email: str, password: str):
    hashed_password = pwd_context.hash(password)  # Hash password
    db_user = models.User(username=username, email=email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)
