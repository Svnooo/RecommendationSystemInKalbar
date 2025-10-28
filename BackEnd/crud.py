from sqlalchemy.orm import Session
import models
import schemas
from passlib.context import CryptContext
import json
from uuid import UUID

# Menggunakan bcrypt untuk hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(db: Session, username: str, email: str, password: str, role: str = "user"):
    hashed_password = pwd_context.hash(password)
    db_user = models.User(
        username=username,
        email=email,
        password_hash=hashed_password,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

from uuid import UUID  # impor ini di file crud.py

def add_feedback(db: Session, user_id: int, recommendation_id: UUID, feedback: str):
    db_feedback = models.UserFeedback(
        user_id=user_id,
        recommendation_id=recommendation_id,
        feedback=feedback
    )
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

def count_dislikes(db: Session, recommendation_id: UUID):
    return db.query(models.UserFeedback).filter(
        models.UserFeedback.recommendation_id == recommendation_id,
        models.UserFeedback.feedback == 'dislike'
    ).count()

def get_feedback_by_recommendation(db: Session, recommendation_id: UUID):
    return db.query(models.UserFeedback).filter(
        models.UserFeedback.recommendation_id == recommendation_id
    ).all()


def save_user_log(db: Session, user_id: int, username: str, preferensi: str, rekomendasi: dict):
    log = models.UserLog(
        user_id=user_id,
        username=username,
        preferensi=preferensi,
        rekomendasi_json=json.dumps(rekomendasi)
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_all_logs(db: Session):
    return db.query(models.UserLog).order_by(models.UserLog.timestamp.desc()).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_all_preferences(db: Session):
    prefs = db.query(models.Preference).all()
    result = []
    for pref in prefs:
        result.append({
            "id": pref.id,
            "username": pref.user.username if pref.user else "Unknown",
            "kab_kota": pref.kab_kota,
            "budget_hotel": pref.budget_hotel,
            "jenis_wisata": pref.jenis_wisata,
            "jenis_makan": pref.jenis_makan,
            "prioritas": pref.prioritas,
            "jumlah_paket": pref.jumlah_paket,
            "timestamp": pref.timestamp
        })
    return result

def save_preference(db: Session, preference: schemas.PreferenceInput, user_id: int):
    pref = models.Preference(**preference.dict(), user_id=user_id)
    db.add(pref)
    db.commit()
    db.refresh(pref)
    return pref

def delete_feedback(db: Session, feedback_id: int) -> bool:
    obj = db.query(models.UserFeedback).filter(models.UserFeedback.feedback_id == feedback_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def delete_user(db: Session, user_id: int) -> bool:
    obj = db.query(models.User).filter(models.User.id == user_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def delete_preference(db: Session, preference_id: int) -> bool:
    obj = db.query(models.Preference).filter(models.Preference.id == preference_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

def delete_log(db: Session, log_id: int) -> bool:
    obj = db.query(models.UserLog).filter(models.UserLog.id == log_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
