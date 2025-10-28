# BackEnd/config.py

# === Koneksi Neo4j ===
NEO4J_URI = "bolt://localhost:7690"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "stev12345"  

# === Default User Preference ===
DEFAULT_USER_PREFERENCES = {
    "kab_kota": "pontianak",
    "budget_hotel": "tinggi",
    "jenis_wisata": "alam",
    "jenis_makan": "halal",
    "prioritas": "rating",
    "jumlah_paket": "5"
}

# === Bobot Prioritas Scoring (alpha = rating, beta = ulasan, gamma = jarak) ===
SCORE_WEIGHTS = {
    "rating": {"alpha": 0.7, "beta": 0.3, "gamma": 0.0},
    "jarak": {"alpha": 0.1, "beta": 0.2, "gamma": 0.7},
    "keduanya": {"alpha": 0.5, "beta": 0.25, "gamma": 0.25}
}

# === Kategori Nilai Normalisasi ===
KATEGORI_NILAI = {
    "wisata": {
        "wisata alam": 0.5,
        "wisata sejarah": 1.0
    },
    "hotel": {
        "penginapan": 0.5,
        "hotel": 1.0
    },
    "makan": {
        "halal": 0.5,
        "non-halal": 1.0
    }
}

# === Jumlah default rekomendasi ===
RECOMMENDATION_COUNT = {
    "min": 3,
    "max": 5,
    "per_jenis": 5
}

# config.py
DISTANCE_NORMALIZATION = {
    'wisata': 20.0,
    'makan': 10.0
}

