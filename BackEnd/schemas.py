from datetime import datetime
from pydantic import BaseModel, validator
from typing import Optional
from uuid import UUID  

class PreferenceInput(BaseModel):
    kab_kota: str
    budget_hotel: str
    jenis_wisata: str
    jenis_makan: str
    prioritas: str
    jumlah_paket: int
    

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_super: bool
    created_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class FeedbackBase(BaseModel):
    recommendation_id: UUID  # Ubah ke UUID
    feedback: str  # 'like' atau 'dislike'

    @validator("feedback")
    def check_feedback_value(cls, v):
        if v not in ("like", "dislike"):
            raise ValueError("feedback harus 'like' atau 'dislike'")
        return v

class FeedbackCreate(BaseModel):
    recommendation_id: UUID  # Ubah ke UUID
    feedback: str

    @validator('feedback')
    def validate_feedback(cls, v):
        if v not in ('like', 'dislike'):
            raise ValueError('feedback harus "like" atau "dislike"')
        return v

class FeedbackResponse(FeedbackBase):
    feedback_id: int
    timestamp: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class FeedbackOut(BaseModel):
    feedback_id: int
    user_id: int
    recommendation_id: UUID  # Ubah ke UUID
    feedback: str
    timestamp: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserLogOut(BaseModel):
    id: int
    user_id: int
    username: str
    timestamp: datetime
    preferensi: str
    rekomendasi_json: str

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class PreferenceOut(BaseModel):
    id: int
    username: str
    kab_kota: str
    budget_hotel: str
    jenis_wisata: str
    jenis_makan: str
    prioritas: str
    jumlah_paket: int
    timestamp: Optional[datetime]  # ini opsional

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class DeleteResponse(BaseModel):
    message: str
