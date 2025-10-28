from config import RECOMMENDATION_COUNT
from services.data_loader import load_data, preprocess_data
from services.graph_builder import (build_knowledge_graph,
                                    calculate_relevance_with_preferences,
                                    filter_data_by_preferences)
from services.recommendation import \
    generate_recommendation_core as generate_recommendation_in_recommendation
import uuid

def generate_recommendation(user_preferences):
    try:
        print("[DEBUG] User Preferences:", user_preferences)

        hotel_df, kab_df, alam_df, sejarah_df, makan_df = load_data()
        hotel_df, alam_filtered, sejarah_filtered, makan_df, distance_df = preprocess_data(
            hotel_df, kab_df, alam_df, sejarah_df, makan_df
        )

        hotel_filtered, wisata_filtered, makan_filtered = filter_data_by_preferences(
            hotel_df, alam_filtered, sejarah_filtered, makan_df, user_preferences
        )

        relevance_df = calculate_relevance_with_preferences(
            hotel_filtered, wisata_filtered, makan_filtered, distance_df, user_preferences
        )

        if relevance_df.empty:
            raise ValueError("No relevant data found after calculating relevance scores.")

        build_knowledge_graph(hotel_filtered, wisata_filtered, makan_filtered, relevance_df)

        kab_kota = user_preferences.get("kab_kota", "")
        prioritas = user_preferences.get("prioritas", "rating")

        # Ambil jumlah paket dari preferensi pengguna (default ke 5 jika tidak ada)
        jumlah_paket = user_preferences.get("jumlah_paket", 5)

        # Kirim jumlah_paket ke fungsi rekomendasi
        rekomendasi = generate_recommendation_in_recommendation(
            kab_kota, prioritas, jumlah_paket=jumlah_paket
        )

        formatted_rekomendasi = []
        if rekomendasi:
            for i, paket in enumerate(rekomendasi, 1):
                formatted_paket = {
                    "Akomodasi": paket["Akomodasi"],
                    "Tempat Wisata": [],
                    "Tempat Makan": [],
                    "Ranking": i,
                    "recommendation_id": str(uuid.uuid4())  # Menggunakan UUID sebagai recommendation_id
                }

                for w in paket["Tempat Wisata"]:
                    formatted_paket["Tempat Wisata"].append({
                        "nama_tempat": w["nama_tempat"],
                        "rating": w["rating"],
                        "distance": w["distance"],
                        "jumlah_ulasan": w.get("jumlah_ulasan", 0),
                        "weight": w.get("weight", w.get("relevance_score", 0))
                    })

                for m in paket["Tempat Makan"]:
                    formatted_paket["Tempat Makan"].append({
                        "nama_tempat": m["nama_tempat"],
                        "rating": m["rating"],
                        "distance": m["distance"],
                        "jumlah_ulasan": m.get("jumlah_ulasan", 0),
                        "weight": m.get("weight", m.get("relevance_score", 0))
                    })

                formatted_rekomendasi.append(formatted_paket)

        return formatted_rekomendasi

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Terjadi kesalahan saat membuat rekomendasi: {str(e)}"}