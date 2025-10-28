import json
from typing import List, Dict, Optional, Set
from sqlalchemy.orm import Session
import models
from datetime import datetime

# --- Fungsi evaluasi dasar ---
def evaluate_recommendations_with_dislike(
    recommended_items: List[str],
    liked_items: List[str],
    disliked_items: List[str],
    k: int
) -> Dict[str, float]:
    recommended_k = recommended_items[:k]
    hits = set(recommended_k) & set(liked_items)
    false_positives = set(recommended_k) & set(disliked_items)
    
    precision = len(hits) / k if k > 0 else 0
    recall = len(hits) / len(liked_items) if liked_items else 0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    hit_rate = 1.0 if len(hits) > 0 else 0.0
    
    fpr = len(false_positives) / len(disliked_items) if disliked_items else 0
    dislike_ratio = len(false_positives) / k if k > 0 else 0
    
    return {
        f"precision@{k}": precision,
        f"recall@{k}": recall,
        f"f1@{k}": f1,
        f"hit_rate@{k}": hit_rate,
        f"false_positive_rate@{k}": fpr,
        f"dislike_ratio@{k}": dislike_ratio
    }

# --- Fungsi ambil data dari DB ---
def get_user_likes(db: Session) -> Dict[int, List[str]]:
    user_likes = {}
    feedbacks = db.query(models.UserFeedback).filter(models.UserFeedback.feedback == "like").all()
    for fb in feedbacks:
        rec_id = str(fb.recommendation_id)
        user_likes.setdefault(fb.user_id, []).append(rec_id)
    return user_likes

def get_user_dislikes(db: Session) -> Dict[int, List[str]]:
    user_dislikes = {}
    feedbacks = db.query(models.UserFeedback).filter(models.UserFeedback.feedback == "dislike").all()
    for fb in feedbacks:
        rec_id = str(fb.recommendation_id)
        user_dislikes.setdefault(fb.user_id, []).append(rec_id)
    return user_dislikes

def get_user_recommendations(
    db: Session,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
) -> Dict[int, List[str]]:
    recs = {}
    query = db.query(models.UserLog).order_by(models.UserLog.timestamp.desc())

    if start_time:
        query = query.filter(models.UserLog.timestamp >= start_time)
    if end_time:
        query = query.filter(models.UserLog.timestamp <= end_time)

    logs = query.all()
    for log in logs:
        user_id = log.user_id
        try:
            rekom_list = json.loads(log.rekomendasi_json)
            if isinstance(rekom_list, list) and rekom_list:
                rec_ids = [str(r.get("recommendation_id")) for r in rekom_list if r.get("recommendation_id")]
                # Ambil rekomendasi terbaru per user (hanya yang pertama diurutkan desc)
                if user_id not in recs:
                    recs[user_id] = rec_ids
        except Exception:
            continue
    return recs

# --- Fungsi evaluasi utama ---
def evaluate_users(
    db: Session,
    k: int = 5,
    selected_user_ids: Optional[Set[int]] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None
) -> Dict[str, Dict]:
    all_recommendations = get_user_recommendations(db, start_time, end_time)
    all_likes = get_user_likes(db)
    all_dislikes = get_user_dislikes(db)

    if selected_user_ids is not None:
        user_ids = selected_user_ids.intersection(all_recommendations.keys())
    else:
        user_ids = all_recommendations.keys()

    per_user_metrics = {}
    precisions, recalls, f1s, hit_rates, fprs, dislike_ratios = [], [], [], [], [], []

    for user_id in user_ids:
        recs = all_recommendations.get(user_id, [])
        likes = all_likes.get(user_id, [])
        dislikes = all_dislikes.get(user_id, [])
        metrics = evaluate_recommendations_with_dislike(recs, likes, dislikes, k)
        per_user_metrics[user_id] = metrics

        precisions.append(metrics[f"precision@{k}"])
        recalls.append(metrics[f"recall@{k}"])
        f1s.append(metrics[f"f1@{k}"])
        hit_rates.append(metrics[f"hit_rate@{k}"])
        fprs.append(metrics[f"false_positive_rate@{k}"])
        dislike_ratios.append(metrics[f"dislike_ratio@{k}"])

    n = len(precisions)
    overall_metrics = {
        f"mean_precision@{k}": sum(precisions) / n if n > 0 else 0,
        f"mean_recall@{k}": sum(recalls) / n if n > 0 else 0,
        f"mean_f1@{k}": sum(f1s) / n if n > 0 else 0,
        f"mean_hit_rate@{k}": sum(hit_rates) / n if n > 0 else 0,
        f"mean_false_positive_rate@{k}": sum(fprs) / n if n > 0 else 0,
        f"mean_dislike_ratio@{k}": sum(dislike_ratios) / n if n > 0 else 0,
    }

    return {
        "per_user": per_user_metrics,
        "overall": overall_metrics
    }
