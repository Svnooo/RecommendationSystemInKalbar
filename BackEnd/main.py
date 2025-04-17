import logging
import os
import sys

# Suppress all print statements in terminal
sys.stdout = open(os.devnull, 'w')

import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import PreferenceInput
from recommender import generate_recommendation
from sqlalchemy.orm import Session

import crud, database, models, schemas

app = FastAPI()

# Dependency untuk mendapatkan session database
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
# Set up logging for debugging purposes if needed
logging.basicConfig(level=logging.INFO)  # Optional: Logs will go into a file if needed

# Configuring CORS so that frontend React can access it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Sesuaikan dengan domain frontend jika deploy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "API Recommender aktif!"}

@app.post("/recommend")
def recommend(preference: PreferenceInput):
    try:
        user_preferences = preference.dict()
        # Debug log untuk memeriksa preferensi
        print(f"Received preferences: {user_preferences}")

        result = generate_recommendation(user_preferences)
        print(f"Recommendation result: {result}")

        return {"rekomendasi": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

# Endpoint untuk pendaftaran pengguna
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username sudah ada.")
    return crud.create_user(db=db, username=user.username, email=user.email, password=user.password)

# Endpoint untuk login pengguna
@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user is None or not crud.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"msg": "Login berhasil"}





if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, log_level="warning")  # Only log warnings and errors
    sys.stdout = sys.__stdout__  # Restore stdout for potential debugging output later
