import os
import pickle

import numpy as np
import pandas as pd
from config import SCORE_WEIGHTS
from connectors.neo4j_connector import neo4j_conn
from services.data_loader import haversine_distance


def filter_data_by_preferences(hotel_df, alam_filtered, sejarah_filtered, makan_df, user_preferences):
    kabupaten = user_preferences['kab_kota'].lower().strip()

    # Filtering hotels based on budget
    hotel_filtered = hotel_df[hotel_df['kab_kota'].str.lower().str.strip() == kabupaten]
    if user_preferences.get('budget_hotel') == 'rendah':
        hotel_filtered = hotel_filtered[hotel_filtered['kategori_nilai'] == 0.5]
    elif user_preferences.get('budget_hotel') == 'tinggi':
        hotel_filtered = hotel_filtered[hotel_filtered['kategori_nilai'] == 1.0]

    # Check if any hotels are left after filtering
    if hotel_filtered.empty:
        raise ValueError(f"No hotels found for {kabupaten} with the specified preferences.")

    # Filtering tourist spots based on type
    if user_preferences.get('jenis_wisata') == 'alam':
        wisata_filtered = alam_filtered
    elif user_preferences.get('jenis_wisata') == 'sejarah':
        wisata_filtered = sejarah_filtered
    else:
        wisata_filtered = pd.concat([alam_filtered, sejarah_filtered], ignore_index=True)

    # Check if any tourist spots are left after filtering
    if wisata_filtered.empty:
        raise ValueError(f"No tourist spots found for {kabupaten} with the specified preferences.")

    # Ensure makan_filtered is assigned, even if no specific preference is set
    if user_preferences.get('jenis_makan') == 'halal':
        makan_filtered = makan_df[makan_df['kategori_nilai'] == 0.5]
    elif user_preferences.get('jenis_makan') == 'non-halal':
        makan_filtered = makan_df[makan_df['kategori_nilai'] == 1.0]
    else:
        makan_filtered = makan_df  # If no preference, include all restaurants

    # Check if any restaurants are left after filtering
    if makan_filtered.empty:
        raise ValueError(f"No restaurants found for {kabupaten} with the specified preferences.")

    print("\n[INFO] Data setelah filtering preferensi:")
    print(f" - Hotel         : {len(hotel_filtered)} item")
    print(f" - Tempat Wisata : {len(wisata_filtered)} item")
    print(f" - Tempat Makan  : {len(makan_filtered)} item")

    return hotel_filtered, wisata_filtered, makan_filtered

def calculate_relevance_with_preferences(hotel_df, wisata_df, makan_df, distance_df, user_preferences, cache_dir="cache"):
    relevances = []
    weights = SCORE_WEIGHTS.get(user_preferences.get('prioritas', 'rating'), SCORE_WEIGHTS['rating'])
    alpha, beta, gamma = weights['alpha'], weights['beta'], weights['gamma']

    # Menambahkan jumlah rekomendasi berdasarkan preferensi pengguna
    jumlah_paket = user_preferences.get('jumlah_paket', 5)  # Default ke 5 paket jika tidak ada preferensi
    
    for _, hotel in hotel_df.iterrows():
        hotel_name = hotel['nama_tempat']
        hotel_lat, hotel_lon = hotel['latitude'], hotel['longitude']
        
        # Menghitung relevansi untuk wisata
        for _, wisata in wisata_df.iterrows():
            distance = haversine_distance((hotel_lat, hotel_lon), (wisata['latitude'], wisata['longitude']))
            norm_distance = distance / 20.0
            relevance = (alpha * wisata['rating']) + (beta * np.log1p(wisata['jumlah_ulasan'])) - (gamma * norm_distance)
            relevances.append({
                'from': hotel_name,
                'to': wisata['nama_tempat'],
                'relevance_score': relevance
            })
        
        # Menghitung relevansi untuk tempat makan
        for _, makan in makan_df.iterrows():
            distance = haversine_distance((hotel_lat, hotel_lon), (makan['latitude'], makan['longitude']))
            norm_distance = distance / 10.0
            relevance = (alpha * makan['rating']) + (beta * np.log1p(makan['jumlah_ulasan'])) - (gamma * norm_distance)
            relevances.append({
                'from': hotel_name,
                'to': makan['nama_tempat'],
                'relevance_score': relevance
            })

    # Membuat DataFrame relevansi
    relevance_df = pd.DataFrame(relevances)

    # Menyaring hasil relevansi berdasarkan jumlah rekomendasi yang diinginkan pengguna
    relevance_df = relevance_df.nlargest(jumlah_paket, 'relevance_score')  # Ambil jumlah rekomendasi terbaik
    
    return relevance_df


def build_knowledge_graph(hotel_df, wisata_df, makan_df, relevance_df):
    print("[INFO] Menghapus data lama di Neo4j...")
    neo4j_conn.query("MATCH (n) DETACH DELETE n")  # Menghapus graph lama 
    
    def create_node(nama, jenis, kategori, rating, ulasan, kab_kota, nilai, latitude, longitude):
        query = """
        MERGE (n:Place {name: $name})
        ON CREATE SET n.created = timestamp()
        SET n.type = $type,
            n.category = $category,
            n.rating = $rating,
            n.jumlah_ulasan = $ulasan,
            n.kab_kota = $kab_kota,
            n.kategori_nilai = $nilai,
            n.latitude = $latitude,
            n.longitude = $longitude
        """
        params = {
            "name": nama,
            "type": jenis,
            "category": kategori,
            "rating": float(rating),
            "ulasan": int(ulasan),
            "kab_kota": kab_kota,
            "nilai": float(nilai),
            "latitude": latitude,
            "longitude": longitude
        }
        neo4j_conn.query(query, params)

    # Batch insert untuk hotel, wisata, dan makan
    for _, row in hotel_df.iterrows():
        create_node(row['nama_tempat'], 'hotel', row.get('kategori', 'unknown'), row['rating'], row['jumlah_ulasan'], row['kab_kota'], row['kategori_nilai'], row['latitude'], row['longitude'])
    
    for _, row in wisata_df.iterrows():
        create_node(row['nama_tempat'], 'wisata', row.get('kategori wisata', 'unknown'), row['rating'], row['jumlah_ulasan'], row['kab_kota'], row['kategori_nilai'], row['latitude'], row['longitude'])

    for _, row in makan_df.iterrows():
        create_node(row['nama_tempat'], 'makan', row.get('kategori', 'unknown'), row['rating'], row['jumlah_ulasan'], row['kab_kota'], row['kategori_nilai'], row['latitude'], row['longitude'])

    # Mengatur warna dan ukuran node berdasarkan tipe dan rating
    neo4j_conn.query("""
    MATCH (n:Place)
    SET n.color = CASE
                    WHEN n.type = 'hotel' THEN 'blue'
                    WHEN n.type = 'wisata' THEN 'green'
                    WHEN n.type = 'makan' THEN 'orange'
                    ELSE 'gray'
                  END,
        n.size = CASE
                    WHEN n.rating > 4.5 THEN 50
                    WHEN n.rating > 3.5 THEN 40
                    ELSE 30
                  END
    """)

    # Memasukkan relasi RELEVANT_TO antara nodes berdasarkan relevansi
    for _, row in relevance_df.iterrows():
        query = """
        MATCH (a:Place {name: $from}), (b:Place {name: $to})
        MERGE (a)-[r:RELEVANT_TO]->(b)
        SET r.weight = $weight
        """
        params = {
            "from": row['from'],
            "to": row['to'],
            "weight": float(row['relevance_score'])
        }
        neo4j_conn.query(query, params)

    # Verifikasi data
    print("[INFO] Memverifikasi data yang dimasukkan...")
    result = neo4j_conn.query("MATCH (n) RETURN n LIMIT 25")
    print(result)
    
    print("[INFO] Graph berhasil dimuat ke Neo4j.")


