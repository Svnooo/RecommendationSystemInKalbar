import os
import pickle
from math import atan2, cos, radians, sin, sqrt

import numpy as np
import pandas as pd
from config import KATEGORI_NILAI
from sklearn.preprocessing import MinMaxScaler


def load_and_clean(path, required_columns):
    df = pd.read_csv(path)

    for col in required_columns:
        if col not in df.columns:
            raise ValueError(f"Kolom '{col}' tidak ditemukan di {path}")

    df['rating'] = pd.to_numeric(df['rating'], errors='coerce').fillna(0)
    df['jumlah_ulasan'] = pd.to_numeric(df['jumlah_ulasan'], errors='coerce').fillna(0)
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce').fillna(0)
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce').fillna(0)

    return df

def load_data(base_path="data"):
    hotel_df = load_and_clean(os.path.join(base_path, "hotel_dengan_harga_full.csv"),
                              ["nama_tempat", "kategori", "rating", "jumlah_ulasan", "kab_kota", "latitude", "longitude"])
    kabupaten_df = pd.read_csv(os.path.join(base_path, "kabupatenkota.csv"))
    alam_df = load_and_clean(os.path.join(base_path, "ODTW_Alam.csv"),
                             ["nama_tempat", "kategori wisata", "rating", "jumlah_ulasan", "kab_kota", "latitude", "longitude"])
    sejarah_df = load_and_clean(os.path.join(base_path, "ODTW_Sejarah.csv"),
                                ["nama_tempat", "kategori wisata", "rating", "jumlah_ulasan", "kab_kota", "latitude", "longitude"])
    makan_df = load_and_clean(os.path.join(base_path, "Tempat_Makan_Kategori_Final.csv"),
                              ["nama_tempat", "kategori", "rating", "jumlah_ulasan", "kab_kota", "latitude", "longitude"])

    return hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df

def haversine_distance(coord1, coord2, max_distance=50):
    R = 6371000  # Radius Bumi dalam meter

    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])
    
    # Menghitung perbedaan lintang dan bujur
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    # Menghitung nilai 'a' berdasarkan rumus Haversine
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    
    # Menghitung nilai 'c' (jarak angular) menggunakan fungsi atan2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    # Menghitung jarak dalam meter
    distance = R * c  # Jarak dalam meter
    
    # Mengembalikan jarak, tetapi batasi jika lebih dari max_distance
    return min(distance / 1000, max_distance)

def preprocess_data(hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df, cache_dir="cache"):
    # Ensure the cache directory exists
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)

    # Check if the cached file exists
    cache_file = os.path.join(cache_dir, "preprocessed_data.pkl")
    if os.path.exists(cache_file):
        print("[INFO] Loading cached preprocessed data...")
        with open(cache_file, "rb") as f:
            return pickle.load(f)
    
    print("[INFO] Preprocessing data...")

    alam_df['kategori wisata'] = alam_df['kategori wisata'].astype(str).str.lower().str.strip()
    sejarah_df['kategori wisata'] = sejarah_df['kategori wisata'].astype(str).str.lower().str.strip()
    hotel_df['kategori'] = hotel_df['kategori'].astype(str).str.lower().str.strip()
    makan_df['kategori'] = makan_df['kategori'].astype(str).str.lower().str.strip()

    scaler = MinMaxScaler()
    for df in [hotel_df, alam_df, sejarah_df, makan_df]:
        if not df.empty:
            df['rating'] = scaler.fit_transform(df[['rating']])
            df['jumlah_ulasan'] = np.log1p(df['jumlah_ulasan'])

    distances = []
    kabupaten_list = hotel_df['kab_kota'].unique()

    for kabupaten in kabupaten_list:
        hotel_kab = hotel_df[hotel_df['kab_kota'] == kabupaten]
        wisata_kab = pd.concat([alam_df, sejarah_df])[pd.concat([alam_df, sejarah_df])['kab_kota'] == kabupaten]
        makan_kab = makan_df[makan_df['kab_kota'] == kabupaten]

        for _, hotel in hotel_kab.iterrows():
            for _, wisata in wisata_kab.iterrows():
                dist = haversine_distance((hotel['latitude'], hotel['longitude']),
                                          (wisata['latitude'], wisata['longitude']))
                distances.append({'kab_kota': kabupaten, 'from': hotel['nama_tempat'], 'to': wisata['nama_tempat'], 'distance': dist})

            for _, makan in makan_kab.iterrows():
                dist = haversine_distance((hotel['latitude'], hotel['longitude']),
                                          (makan['latitude'], makan['longitude']))
                distances.append({'kab_kota': kabupaten, 'from': hotel['nama_tempat'], 'to': makan['nama_tempat'], 'distance': dist})

        for _, makan in makan_kab.iterrows():
            for _, wisata in wisata_kab.iterrows():
                dist = haversine_distance((makan['latitude'], makan['longitude']),
                                          (wisata['latitude'], wisata['longitude']))
                distances.append({'kab_kota': kabupaten, 'from': makan['nama_tempat'], 'to': wisata['nama_tempat'], 'distance': dist})

    distance_df = pd.DataFrame(distances)

    alam_df['kategori_nilai'] = alam_df['kategori wisata'].map(KATEGORI_NILAI['wisata']).fillna(1.0)
    sejarah_df['kategori_nilai'] = sejarah_df['kategori wisata'].map(KATEGORI_NILAI['wisata']).fillna(1.0)
    hotel_df['kategori_nilai'] = hotel_df['kategori'].map(KATEGORI_NILAI['hotel']).fillna(1.0)
    makan_df['kategori_nilai'] = makan_df['kategori'].map(KATEGORI_NILAI['makan']).fillna(1.0)

    preprocessed_data = (hotel_df, alam_df, sejarah_df, makan_df, distance_df)
    with open(cache_file, "wb") as f:
        pickle.dump(preprocessed_data, f)
    
    return preprocessed_data