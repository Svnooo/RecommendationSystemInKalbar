from datetime import datetime

from pydantic import BaseModel


class PreferenceInput(BaseModel):
    kab_kota: str
    budget_hotel: str
    jenis_wisata: str
    jenis_makan: str
    prioritas: str
    
class UserBase(BaseModel):
    username: str
    email: str

# Model untuk pendaftaran pengguna
class UserCreate(UserBase):
    password: str

# Model untuk login pengguna
class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    created_at: str  

    class Config:
        from_attributes = True