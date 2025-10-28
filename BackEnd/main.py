import logging
import sys
from typing import Dict, List, Optional
from uuid import UUID

import crud
import database
import models
import schemas
import uvicorn
from auth import create_access_token, get_current_user, verify_password
from database import SessionLocal
from fastapi import Depends, FastAPI, HTTPException, Query, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from schemas import DeleteResponse, PreferenceInput, PreferenceOut
from services.evaluasi import \
    evaluate_users  # Pastikan modul evaluasi.py dengan fungsi ini ada
from services.recommender import generate_recommendation
from sqlalchemy.orm import Session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

logging.basicConfig(level=logging.INFO)

@app.get("/")
def root():
    return {"message": "API Recommender aktif!"}

@app.post("/recommend")
def recommend(
    preference: PreferenceInput,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        if current_user is None:
            raise HTTPException(status_code=404, detail="User tidak ditemukan.")

        saved_pref = crud.save_preference(db, preference, current_user.id)

        user_preferences = preference.dict()
        result = generate_recommendation(user_preferences)

        crud.save_user_log(
            db=db,
            user_id=current_user.id,
            username=current_user.username,
            preferensi=preference.prioritas,
            rekomendasi=result
        )

        return {"rekomendasi": result}
    except Exception as e:
        logging.error(f"Error in recommend endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username sudah ada.")

    role = "admin" if user.username == "admin" else "user"
    db_user = crud.create_user(
        db=db,
        username=user.username,
        email=user.email,
        password=user.password,
        role=role
    )
    db_user.created_at = db_user.created_at.isoformat()
    return db_user

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user is None or not crud.verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {
        "msg": "Login berhasil",
        "username": db_user.username,
        "role": db_user.role
    }

@app.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username atau password salah"
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/feedback/", response_model=schemas.FeedbackOut)
def add_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        db_feedback = crud.add_feedback(
            db=db,
            user_id=current_user.id,
            recommendation_id=feedback.recommendation_id,
            feedback=feedback.feedback,
        )
        return db_feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/feedback/{recommendation_id}", response_model=List[schemas.FeedbackOut])
def get_feedback(recommendation_id: UUID, db: Session = Depends(get_db)):
    try:
        feedbacks = crud.get_feedback_by_recommendation(db=db, recommendation_id=recommendation_id)
        return feedbacks
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/feedback/dislikes/{recommendation_id}")
def count_dislike(recommendation_id: UUID, db: Session = Depends(get_db)):
    try:
        dislike_count = crud.count_dislikes(db=db, recommendation_id=recommendation_id)
        return {"recommendation_id": str(recommendation_id), "dislike_count": dislike_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan: {str(e)}")

@app.get("/admin/logs", response_model=List[schemas.UserLogOut])
def get_logs(db: Session = Depends(get_db)):
    return crud.get_all_logs(db)

@app.get("/admin/users", response_model=List[schemas.UserOut])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@app.get("/admin/preferences", response_model=List[PreferenceOut])
def get_preferences(db: Session = Depends(get_db)):
    prefs = crud.get_all_preferences(db)
    return prefs

@app.get("/admin/evaluation")
def evaluation_endpoint(
    k: int = 5,
    user_ids: Optional[List[int]] = Query(None),
    start_time: Optional[str] = Query(None, description="Filter mulai waktu (ISO format)"),
    end_time: Optional[str] = Query(None, description="Filter akhir waktu (ISO format)"),
    db: Session = Depends(get_db)
):
    selected_users = set(user_ids) if user_ids else None

    # Parsing datetime ISO string jika diberikan
    start_dt = None
    end_dt = None
    try:
        if start_time:
            start_dt = datetime.fromisoformat(start_time)
        if end_time:
            end_dt = datetime.fromisoformat(end_time)
    except ValueError:
        raise HTTPException(status_code=400, detail="Format start_time atau end_time harus ISO datetime yang valid")

    result = evaluate_users(
        db,
        k=k,
        selected_user_ids=selected_users,
        start_time=start_dt,
        end_time=end_dt,
    )
    return result

@app.delete("/feedback/{feedback_id}", response_model=DeleteResponse)
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_feedback(db, feedback_id):
        raise HTTPException(status_code=404, detail="Feedback tidak ditemukan")
    return DeleteResponse(message="Feedback berhasil dihapus")

@app.delete("/users/{user_id}", response_model=DeleteResponse)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Tambahkan pengecekan role jika perlu (misal hanya admin boleh hapus user)
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Hanya admin yang bisa menghapus user")
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return DeleteResponse(message="User berhasil dihapus")

@app.delete("/preferences/{preference_id}", response_model=DeleteResponse)
def delete_preference(preference_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_preference(db, preference_id):
        raise HTTPException(status_code=404, detail="Preferensi tidak ditemukan")
    return DeleteResponse(message="Preferensi berhasil dihapus")

@app.delete("/logs/{log_id}", response_model=DeleteResponse)
def delete_log(log_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not crud.delete_log(db, log_id):
        raise HTTPException(status_code=404, detail="Log tidak ditemukan")
    return DeleteResponse(message="Log berhasil dihapus")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("Validation error:", exc.errors())
    print("Request body:", exc.body)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True, log_level="warning")
    sys.stdout = sys.__stdout__
