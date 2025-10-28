from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID  
import uuid
from database import Base
from pydantic import BaseModel


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="user", nullable=False)
    is_super = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    feedbacks = relationship("UserFeedback", back_populates="user")
    logs = relationship("UserLog", back_populates="user")
    preferences = relationship("Preference", back_populates="user")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    feedback_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    recommendation_id = Column(UUID(as_uuid=True), default=uuid.uuid4)  # Menggunakan UUID
    feedback = Column(String)  # 'like' atau 'dislike'
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")


class UserLog(Base):
    __tablename__ = "user_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    preferensi = Column(String)  # misal: 'rating', 'jarak'
    rekomendasi_json = Column(String)  # JSON string dari hasil rekomendasi

    user = relationship("User", back_populates="logs")


class PreferenceOut(BaseModel):
    id: int
    kab_kota: str
    budget_hotel: str
    jenis_wisata: str
    jenis_makan: str
    prioritas: str
    jumlah_paket: int

    class Config:
        from_attributes = True


class Preference(Base):
    __tablename__ = "preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    kab_kota = Column(String)
    budget_hotel = Column(String)
    jenis_wisata = Column(String)
    jenis_makan = Column(String)
    prioritas = Column(String)
    jumlah_paket = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)  # <-- ini wajib

    user = relationship("User", back_populates="preferences")  # relasi ke User
