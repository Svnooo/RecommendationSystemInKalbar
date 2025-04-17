import random
from collections import defaultdict
from math import atan2, cos, radians, sin, sqrt
import matplotlib.pyplot as plt
import networkx as nx
import numpy as np
import pandas as pd
from fuzzywuzzy import fuzz
from geopy.distance import geodesic
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.preprocessing import MinMaxScaler



# Fungsi untuk membaca dataset
def load_data():
    # Membaca dataset dari file CSV
    hotel_df = pd.read_csv("data/hotel_dengan_harga_full.csv")
    kabupaten_df = pd.read_csv("data/kabupatenkota.csv")
    alam_df = pd.read_csv("data/ODTW_Alam.csv")
    sejarah_df = pd.read_csv("data/ODTW_Sejarah.csv")
    makan_df = pd.read_csv("data/Tempat_Makan_Kategori_Final.csv")
    
    # Menampilkan informasi awal dataset
    datasets = {
        "Hotel": hotel_df,
        "Kabupaten/Kota": kabupaten_df,
        "Wisata Alam": alam_df,
        "Wisata Sejarah": sejarah_df,
        "Tempat Makan": makan_df
    }
    
    for name, df in datasets.items():
        print(f"\n=== {name} Dataset ===")
        print(f"Jumlah Baris dan Kolom: {df.shape}")
        print("Beberapa data awal:")
        print(df.head(), "\n")
        print("Jumlah nilai yang kosong per kolom:")
        print(df.isnull().sum(), "\n" + "="*50)

    return hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df

# Menjalankan fungsi untuk membaca dan menampilkan data awal
hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df = load_data()


# Fungsi untuk menghitung jarak Haversine
def haversine_distance(coord1, coord2):
    R = 6371  # Radius Bumi dalam kilometer
    lat1, lon1 = radians(coord1[0]), radians(coord1[1])
    lat2, lon2 = radians(coord2[0]), radians(coord2[1])

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c  # Kembali dalam kilometer


# Fungsi untuk menghitung jarak Euclidean menggunakan koordinat (garis lurus)
def euclidean_distance(coord1, coord2):
    return np.sqrt((coord1[0] - coord2[0]) ** 2 + (coord1[1] - coord2[1]) ** 2)

# Fungsi preprocessing data
def preprocess_data(hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df):
    # 1. Normalisasi Case untuk Nama Tempat dan Kategori
    for df in [hotel_df, alam_df, sejarah_df, makan_df]:
        df['nama_tempat'] = df['nama_tempat'].astype(str).str.lower().str.strip()
        df['kab_kota'] = df['kab_kota'].astype(str).str.lower().str.strip()
    
    alam_df['kategori wisata'] = alam_df['kategori wisata'].astype(str).str.lower().str.strip()
    sejarah_df['kategori wisata'] = sejarah_df['kategori wisata'].astype(str).str.lower().str.strip()
    hotel_df['kategori'] = hotel_df['kategori'].astype(str).str.lower().str.strip()
    makan_df['kategori'] = makan_df['kategori'].astype(str).str.lower().str.strip()

    # 2. Normalisasi Rating dan Jumlah Ulasan
    scaler = MinMaxScaler()

    for df in [hotel_df, alam_df, sejarah_df, makan_df]:
        # Pastikan tidak ada data kosong (NaN) pada kolom yang dinormalisasi
        if df['rating'].isnull().sum() > 0:
            df['rating'] = df['rating'].fillna(0)  # Isi NaN dengan 0 atau metode lain yang sesuai

        if df['jumlah_ulasan'].isnull().sum() > 0:
            df['jumlah_ulasan'] = df['jumlah_ulasan'].fillna(0)  # Isi NaN dengan 0 atau metode lain yang sesuai
        
        # Pastikan ada data sebelum menggunakan MinMaxScaler
        if len(df['rating']) > 0:
            df['rating'] = scaler.fit_transform(df[['rating']])
        
        if len(df['jumlah_ulasan']) > 0:
            df['jumlah_ulasan'] = np.log1p(df['jumlah_ulasan'])  # Transformasi log jika data ada


    # 3. Penghitungan Jarak Antar Entitas dalam Kabupaten/Kota
    distances = []

    # Looping berdasarkan kabupaten/kota
    kabupaten_list = hotel_df['kab_kota'].unique()

    for kabupaten in kabupaten_list:
        # Filter data hanya untuk kabupaten/kota yang sama
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
                          (wisata['latitude'], wisata['longitude']))
                distances.append({'kab_kota': kabupaten, 'from': hotel['nama_tempat'], 'to': makan['nama_tempat'], 'distance': dist})

        for _, makan in makan_kab.iterrows():
            for _, wisata in wisata_kab.iterrows():
                dist = haversine_distance((hotel['latitude'], hotel['longitude']),
                          (wisata['latitude'], wisata['longitude']))
                distances.append({'kab_kota': kabupaten, 'from': makan['nama_tempat'], 'to': wisata['nama_tempat'], 'distance': dist})

    distance_df = pd.DataFrame(distances)

    # 4. Normalisasi Kategori
    kategori_wisata = {'wisata alam': 0.5, 'wisata sejarah': 1.0}
    kategori_hotel = {'penginapan': 0.5, 'hotel': 1.0}
    kategori_makan = {'halal': 0.5, 'non-halal': 1.0}

    alam_df['kategori_nilai'] = alam_df['kategori wisata'].map(kategori_wisata)
    sejarah_df['kategori_nilai'] = sejarah_df['kategori wisata'].map(kategori_wisata)
    hotel_df['kategori_nilai'] = hotel_df['kategori'].map(kategori_hotel)
    makan_df['kategori_nilai'] = makan_df['kategori'].map(kategori_makan)

    # Menampilkan hasil preprocessing
    print("\n=== Data Setelah Preprocessing ===")
    
    print("\n>> Hotel Data (Normalisasi Rating, Kategori, dan Nama Tempat)")
    print(hotel_df[['kab_kota', 'nama_tempat', 'rating', 'jumlah_ulasan', 'kategori_nilai']].head())

    print("\n>> Wisata Alam Data (Normalisasi Rating, Kategori, dan Nama Tempat)")
    print(alam_df[['kab_kota', 'nama_tempat', 'rating', 'jumlah_ulasan', 'kategori_nilai']].head())

    print("\n>> Wisata Sejarah Data (Normalisasi Rating, Kategori, dan Nama Tempat)")
    print(sejarah_df[['kab_kota', 'nama_tempat', 'rating', 'jumlah_ulasan', 'kategori_nilai']].head())

    print("\n>> Tempat Makan Data (Normalisasi Rating, Kategori, dan Nama Tempat)")
    print(makan_df[['kab_kota', 'nama_tempat', 'rating', 'jumlah_ulasan', 'kategori_nilai']].head())

    print("\n>> Data Jarak Antar Entitas (Euclidean Distance, dalam Kabupaten yang Sama)")
    print(distance_df.head())

    return hotel_df, alam_df, sejarah_df, makan_df, distance_df

# Menjalankan fungsi preprocessing
hotel_df, alam_df, sejarah_df, makan_df, distance_df = preprocess_data(hotel_df, kabupaten_df, alam_df, sejarah_df, makan_df)


# Fungsi untuk menampilkan opsi yang lebih mudah bagi user

# Menjalankan input preferensi user dengan dataset kabupaten/kota
user_preferences = {
    "kab_kota": "pontianak",
    "budget_hotel": "tinggi",
    "jenis_wisata": "alam",
    "jenis_makan": "halal",
    "prioritas": "rating"
}


# Fungsi untuk memfilter data berdasarkan preferensi user
def filter_data_by_preferences(hotel_df, alam_df, sejarah_df, makan_df, user_preferences):
    kabupaten = user_preferences['kab_kota']

    # Filter berdasarkan kabupaten/kota
    hotel_filtered = hotel_df[hotel_df['kab_kota'] == kabupaten]
    alam_filtered = alam_df[alam_df['kab_kota'] == kabupaten]
    sejarah_filtered = sejarah_df[sejarah_df['kab_kota'] == kabupaten]
    makan_filtered = makan_df[makan_df['kab_kota'] == kabupaten]

    # Filter Budget Hotel
    if user_preferences['budget_hotel'] == 'rendah':
        hotel_filtered = hotel_filtered[hotel_filtered['kategori_nilai'] == 0.5]
    elif user_preferences['budget_hotel'] == 'tinggi':
        hotel_filtered = hotel_filtered[hotel_filtered['kategori_nilai'] == 1.0]

    # Filter Jenis Wisata
    if user_preferences['jenis_wisata'] == 'alam':
        wisata_filtered = alam_filtered
    elif user_preferences['jenis_wisata'] == 'sejarah':
        wisata_filtered = sejarah_filtered
    else:
        wisata_filtered = pd.concat([alam_filtered, sejarah_filtered])

    # Filter Jenis Tempat Makan
    if user_preferences['jenis_makan'] == 'halal':
        makan_filtered = makan_filtered[makan_filtered['kategori_nilai'] == 0.5]
    elif user_preferences['jenis_makan'] == 'non-halal':
        makan_filtered = makan_filtered[makan_filtered['kategori_nilai'] == 1.0]

    print("\nData telah difilter berdasarkan preferensi user.")
    
    return hotel_filtered, wisata_filtered, makan_filtered

# Menjalankan filter data berdasarkan preferensi user
hotel_filtered, wisata_filtered, makan_filtered = filter_data_by_preferences(
    hotel_df, alam_df, sejarah_df, makan_df, user_preferences
)

def calculate_relevance_with_preferences(hotel_df, wisata_df, makan_df, distance_df, user_preferences):
    relevances = []
    hotel_strategic_score = {}

    kabupaten = user_preferences['kab_kota']
    prioritas = user_preferences['prioritas']

    # Bobot dinamis berdasarkan preferensi user
    if prioritas == "rating":
        alpha, beta, gamma = 0.7, 0.3, 0.0
    elif prioritas == "jarak":
        alpha, beta, gamma = 0.1, 0.2, 0.7
    else: 
        alpha, beta, gamma = 0.5, 0.25, 0.25

    hotel_kab = hotel_df[hotel_df['kab_kota'] == kabupaten]
    wisata_kab = wisata_df[wisata_df['kab_kota'] == kabupaten]
    makan_kab = makan_df[makan_df['kab_kota'] == kabupaten]
    distance_kab = distance_df[distance_df['kab_kota'] == kabupaten]

    max_distance = distance_kab['distance'].max() if not distance_kab.empty else 1.0

    all_nodes = pd.concat([hotel_kab, wisata_kab, makan_kab])

    for _, row in distance_kab.iterrows():
        asal, tujuan, jarak = row['from'], row['to'], row['distance']
        norm_jarak = jarak / max_distance

        data_tujuan = all_nodes[all_nodes['nama_tempat'] == tujuan]
        if not data_tujuan.empty:
            rating = data_tujuan.iloc[0]['rating']
            ulasan = data_tujuan.iloc[0]['jumlah_ulasan']
            kategori_nilai = data_tujuan.iloc[0]['kategori_nilai']

            relevansi = (
                alpha * (rating ** 2 + (np.log1p(ulasan)) ** 1.2)  # Rating dan ulasan
                - gamma * norm_jarak  # Jarak
            )
            
            relevances.append({
                'kab_kota': kabupaten,
                'from': asal,
                'to': tujuan,
                'distance': jarak,
                'rating': rating,
                'jumlah_ulasan': ulasan,
                'kategori_nilai': kategori_nilai,
                'relevance_score': relevansi
            })

    relevance_df = pd.DataFrame(relevances)
    return relevance_df, hotel_strategic_score


relevance_df, hotel_strategic_score = calculate_relevance_with_preferences(
    hotel_filtered, wisata_filtered, makan_filtered, distance_df, user_preferences
)



def build_knowledge_graph(hotel_df, wisata_df, makan_df, relevance_df):
    G = nx.Graph()

    # === Tambahkan Node
    for _, row in hotel_df.iterrows():
        G.add_node(
            row['nama_tempat'],
            type='hotel',
            category=row.get('kategori', 'unknown'),
            rating=row.get('rating', 0),
            jumlah_ulasan=row.get('jumlah_ulasan', 0),
            kab_kota=row.get('kab_kota', ''),
            kategori_nilai=row.get('kategori_nilai', 1.0)
        )

    for _, row in wisata_df.iterrows():
        G.add_node(
            row['nama_tempat'],
            type='wisata',
            category=row.get('kategori wisata', 'unknown'),
            rating=row.get('rating', 0),
            jumlah_ulasan=row.get('jumlah_ulasan', 0),
            kab_kota=row.get('kab_kota', ''),
            kategori_nilai=row.get('kategori_nilai', 1.0)
        )

    for _, row in makan_df.iterrows():
        G.add_node(
            row['nama_tempat'],
            type='makan',
            category=row.get('kategori', 'unknown'),
            rating=row.get('rating', 0),
            jumlah_ulasan=row.get('jumlah_ulasan', 0),
            kab_kota=row.get('kab_kota', ''),
            kategori_nilai=row.get('kategori_nilai', 1.0)
        )

    # === Tambahkan Edge Berdasarkan Relevance
    edge_count = 0
    for _, row in relevance_df.iterrows():
        from_node = row['from']
        to_node = row['to']
        weight = row['relevance_score']

        if from_node in G and to_node in G:
            G.add_edge(from_node, to_node, weight=weight)
            edge_count += 1

    print(f"[INFO] Graph dibangun dengan {len(G.nodes)} nodes dan {edge_count} edges dari relevance_df.")

    # === Tambahan: fallback untuk hotel tanpa koneksi ===
    isolated_hotels = [n for n in G.nodes if G.nodes[n]['type'] == 'hotel' and len(list(G.neighbors(n))) == 0]

    for hotel in isolated_hotels:
        # Ambil edge relevansi dari relevance_df
        related_edges = relevance_df[relevance_df['from'] == hotel].sort_values(by='relevance_score', ascending=False)

        if related_edges.empty:
            continue

        top_related = related_edges.head(5)
        for _, row in top_related.iterrows():
            to_node = row['to']
            weight = row['relevance_score']
            if to_node in G.nodes:
                G.add_edge(hotel, to_node, weight=weight)

        print(f"[INFO] Fallback edge ditambahkan untuk hotel tanpa koneksi: {hotel.title()} -> {len(top_related)} node")

    return G


# Membangun Knowledge Graph
G = build_knowledge_graph(hotel_filtered, wisata_filtered, makan_filtered, relevance_df)


# Modifikasi fungsi weighted_random_walk untuk selalu mendapatkan 5 tempat
def weighted_random_walk(G, start_node, target_type, min_count=5, max_count=5, steps=20):
    visited = []
    current_node = start_node

    for _ in range(steps):
        neighbors = list(G.neighbors(current_node))
        target_neighbors = [n for n in neighbors if G.nodes[n]['type'] == target_type]

        if not target_neighbors:
            break

        weights = [G[current_node][neighbor]['weight'] for neighbor in target_neighbors]
        total_weight = sum(weights)

        if total_weight == 0:
            break  # Safety check biar gak crash

        probabilities = [w / total_weight for w in weights]
        next_node = random.choices(target_neighbors, probabilities, k=1)[0]

        if next_node not in visited:
            visited.append(next_node)
            current_node = next_node

        if len(visited) >= max_count:
            break

    # Fallback cerdas jika hasil kurang dari min_count
    if len(visited) < min_count:
        remaining = min_count - len(visited)
        candidate_nodes = [
            n for n in G.nodes
            if G.nodes[n]['type'] == target_type and n not in visited
        ]

        def fallback_score(n):
            r = G.nodes[n].get('rating', 0)
            u = G.nodes[n].get('jumlah_ulasan', 0)
            c = sum(G[n][nbr]['weight'] for nbr in G.neighbors(n))
            return 0.5 * r + 0.3 * np.log1p(u) + 0.2 * c

        candidate_nodes_sorted = sorted(
            candidate_nodes,
            key=fallback_score,
            reverse=True
        )
        visited.extend(candidate_nodes_sorted[:remaining])

    # Pastikan kita memiliki tepat min_count item
    return visited[:min_count]



# Modify the select_top_hotels function to return 5-10 hotels
def select_top_hotels_by_quality(G, strategic_score, min_n=3, max_n=5):
    # Perbaikan: Tangkap hotel dan penginapan
    hotel_nodes = [
        n for n in G.nodes 
        if (
            (G.nodes[n]['type'] == 'hotel') or 
            (G.nodes[n]['type'] == 'penginapan')
        )
    ]
    
    # Log untuk debugging
    print(f"\n[DEBUG] Total accommodations found: {len(hotel_nodes)}")
    hotel_count = len([n for n in hotel_nodes if G.nodes[n]['type'] == 'hotel'])
    penginapan_count = len([n for n in hotel_nodes if G.nodes[n]['type'] == 'penginapan'])
    print(f"[DEBUG] Hotels: {hotel_count}, Penginapan: {penginapan_count}")
    
    # Fallback jika tidak ada hotel
    if not hotel_nodes:
        print("[ERROR] Tidak ada hotel atau penginapan yang ditemukan!")
        return []

    hotel_scores = {}
    for hotel in hotel_nodes:
        r = G.nodes[hotel].get('rating', 0)
        u = G.nodes[hotel].get('jumlah_ulasan', 0)
        # Perbaikan: Handling untuk weight yang tidak ada
        conn_strength = sum(G[hotel][n].get('weight', 0) for n in G.neighbors(hotel))
        strategic = strategic_score.get(hotel, 0)

        # Perhitungan skor kualitas 
        quality_score = (r ** 2) * np.log1p(u)

        # Skor akhir: 90% kualitas, 10% koneksi
        final_score = 0.9 * quality_score + 0.1 * conn_strength
        hotel_scores[hotel] = final_score

    # Urutkan berdasarkan skor akhir
    sorted_hotels = sorted(hotel_scores.items(), key=lambda x: x[1], reverse=True)

    print("\n[DEBUG] Top Hotel Candidates (by QUALITY):")
    for h, s in sorted_hotels[:max_n]:
        r = G.nodes[h].get('rating', 0)
        u = G.nodes[h].get('jumlah_ulasan', 0)
        hotel_type = G.nodes[h].get('type', 'unknown')
        print(f" - {h} -> score: {s:.2f}, rating: {r}, ulasan: {int(u)}, type: {hotel_type}")

    # Jika tidak cukup hotel, gunakan semua yang tersedia
    available_count = len(sorted_hotels)
    if available_count < min_n:
        print(f"[WARN] Hanya {available_count} hotel/penginapan tersedia, kurang dari {min_n} yang diminta")
        return [hotel[0] for hotel in sorted_hotels]
    
    # Ambil min_n sampai max_n hotel (atau semua yang tersedia, mana yang lebih kecil)
    selection_count = min(max(min_n, available_count), max_n)
    return [hotel[0] for hotel in sorted_hotels[:selection_count]]


def select_top_hotels_by_mix(G, strategic_score, min_n=3, max_n=5):
    # Perbaikan: Tangkap hotel dan penginapan
    hotel_nodes = [
        n for n in G.nodes 
        if (
            (G.nodes[n]['type'] == 'hotel') or 
            (G.nodes[n]['type'] == 'penginapan')
        )
    ]
    
    # Log untuk debugging
    print(f"\n[DEBUG] Total accommodations found (mix): {len(hotel_nodes)}")
    hotel_count = len([n for n in hotel_nodes if G.nodes[n]['type'] == 'hotel'])
    penginapan_count = len([n for n in hotel_nodes if G.nodes[n]['type'] == 'penginapan'])
    print(f"[DEBUG] Hotels: {hotel_count}, Penginapan: {penginapan_count}")
    
    # Fallback jika tidak ada hotel
    if not hotel_nodes:
        print("[ERROR] Tidak ada hotel atau penginapan yang ditemukan!")
        return []
        
    # Handling khusus jika hanya ada satu hotel/penginapan
    if len(hotel_nodes) == 1:
        return hotel_nodes

    # Buat array untuk rating, ulasan, connection strength, dan strategic score
    ratings = np.array([G.nodes[h].get('rating', 0) for h in hotel_nodes]).reshape(-1, 1)
    ulasans = np.array([G.nodes[h].get('jumlah_ulasan', 0) for h in hotel_nodes]).reshape(-1, 1)
    conn_strengths = np.array([
        sum(G[h][n].get('weight', 0) for n in G.neighbors(h)) for h in hotel_nodes
    ]).reshape(-1, 1)
    strategics = np.array([
        strategic_score.get(h, 0) for h in hotel_nodes
    ]).reshape(-1, 1)

    # Perbaikan: Handling untuk MinMaxScaler ketika array kosong atau memiliki nilai yang sama
    def safe_scale(data):
        if np.all(data == data[0]):  # Jika semua nilai sama
            return np.ones(data.shape)
        try:
            scaler = MinMaxScaler()
            return scaler.fit_transform(data)
        except:
            # Jika scaling gagal, gunakan array normalisasi sederhana
            return np.ones(data.shape)
    
    # Normalisasi fitur
    norm_ratings = safe_scale(ratings).flatten()
    norm_ulasans = safe_scale(np.log1p(ulasans)).flatten()
    norm_conn_strengths = safe_scale(conn_strengths).flatten()
    norm_strategics = safe_scale(strategics).flatten()

    hotel_scores = {}
    for i, hotel in enumerate(hotel_nodes):
        score = (
            0.4 * norm_ratings[i] +
            0.3 * norm_ulasans[i] +
            0.2 * norm_conn_strengths[i] +
            0.1 * norm_strategics[i]
        )
        hotel_scores[hotel] = score

    sorted_hotels = sorted(hotel_scores.items(), key=lambda x: x[1], reverse=True)

    # Memilih antara min_n dan max_n hotel, atau semua yang tersedia jika lebih sedikit
    available_count = len(sorted_hotels)
    selection_count = min(max(min_n, available_count), max_n)
    
    print("\n[INFO] Top Hotel Candidates (by MIXED CRITERIA):")
    for h, s in sorted_hotels[:selection_count]:
        r = G.nodes[h].get('rating', 0)
        u = G.nodes[h].get('jumlah_ulasan', 0)
        hotel_type = G.nodes[h].get('type', 'unknown')
        print(f" - {h} -> score: {s:.4f}, rating: {r}, ulasan: {int(u)}, type: {hotel_type}")

    # Jika tidak cukup hotel, gunakan semua yang tersedia
    if available_count < min_n:
        print(f"[WARN] Hanya {available_count} hotel/penginapan tersedia, kurang dari {min_n} yang diminta")
        
    return [hotel[0] for hotel in sorted_hotels[:selection_count]]

# Modifikasi pada fungsi generate_recommendation_by_rating
def generate_recommendation_by_rating(G):
    return generate_recommendation_core(G, rating_weight=0.6, ulasan_weight=0.4, distance_weight=0.0, 
                                       min_count=3, max_count=5, mode='rating')

# Modifikasi pada fungsi generate_recommendation_by_distance
def generate_recommendation_by_distance(G):
    return generate_recommendation_core(G, rating_weight=0.1, ulasan_weight=0.2, distance_weight=0.7, 
                                       min_count=3, max_count=5, mode='jarak')

# Modifikasi pada fungsi generate_recommendation_combined
def generate_recommendation_combined(G):
    return generate_recommendation_core(G, rating_weight=0.5, ulasan_weight=0.25, distance_weight=0.25, 
                                       min_count=3, max_count=5, mode='keduanya')


# Modifikasi fungsi generate_recommendation_core untuk menghasilkan 5-10 paket rekomendasi
def generate_recommendation_core(
    G,
    rating_weight,
    ulasan_weight,
    distance_weight,
    steps=20,
    min_count=3,
    max_count=5,
    rating_threshold=0.4,
    ulasan_threshold=1,
    mode='rating'  # 'rating', 'jarak', 'keduanya'
):
    try:
        if mode == 'rating':
            top_hotels = select_top_hotels_by_quality(G, hotel_strategic_score, min_n=min_count, max_n=max_count)
        else:
            top_hotels = select_top_hotels_by_mix(G, hotel_strategic_score, min_n=min_count, max_n=max_count)

        # Perbaikan: Fallback jika tidak ada hotel terpilih
        if not top_hotels:
            print("[ERROR] Tidak ada hotel yang memenuhi kriteria!")
            all_accommodations = [n for n in G.nodes if G.nodes[n]['type'] in ['hotel', 'penginapan']]
            if all_accommodations:
                import random
                top_hotels = random.sample(all_accommodations, min(max_count, len(all_accommodations)))
                print(f"[INFO] Menggunakan {len(top_hotels)} akomodasi acak sebagai fallback")
            else:
                print("[FATAL] Tidak ada akomodasi di graph!")
                return []

        all_candidates = []

        for hotel in top_hotels:
            # Perbaikan: Error handling untuk weighted_random_walk
            try:
                wisata_list = weighted_random_walk(G, hotel, target_type="wisata", min_count=5, max_count=5, steps=steps)
                if not wisata_list or len(wisata_list) < 5:
                    print(f"[WARN] Random walk gagal untuk wisata dari {hotel}. Menggunakan fallback...")
                    wisata_list = [n for n in G.nodes if G.nodes[n]['type'] == 'wisata'][:5]
                    # Jika masih tidak cukup, duplikasi item yang ada
                    if len(wisata_list) < 5:
                        duplicates_needed = 5 - len(wisata_list)
                        wisata_list = wisata_list + wisata_list[:duplicates_needed]
            except Exception as e:
                print(f"[ERROR] Exception pada random walk wisata: {str(e)}")
                wisata_list = [n for n in G.nodes if G.nodes[n]['type'] == 'wisata'][:5]
                # Jika masih tidak cukup, duplikasi item yang ada
                if len(wisata_list) < 5:
                    duplicates_needed = 5 - len(wisata_list)
                    wisata_list = wisata_list + wisata_list[:duplicates_needed]
                
            try:
                makan_list = weighted_random_walk(G, hotel, target_type="makan", min_count=5, max_count=5, steps=steps)
                if not makan_list or len(makan_list) < 5:
                    print(f"[WARN] Random walk gagal untuk makan dari {hotel}. Menggunakan fallback...")
                    makan_list = [n for n in G.nodes if G.nodes[n]['type'] == 'makan'][:5]
                    # Jika masih tidak cukup, duplikasi item yang ada
                    if len(makan_list) < 5:
                        duplicates_needed = 5 - len(makan_list)
                        makan_list = makan_list + makan_list[:duplicates_needed]
            except Exception as e:
                print(f"[ERROR] Exception pada random walk makan: {str(e)}")
                makan_list = [n for n in G.nodes if G.nodes[n]['type'] == 'makan'][:5]
                # Jika masih tidak cukup, duplikasi item yang ada
                if len(makan_list) < 5:
                    duplicates_needed = 5 - len(makan_list)
                    makan_list = makan_list + makan_list[:duplicates_needed]

            def filter_and_sort(nodes, required_count=5):
                # Tambahkan debugging info
                print(f"[DEBUG] Jumlah nodes sebelum filter: {len(nodes)}")
                
                # Filter utama
                filtered = [
                    n for n in nodes
                    if G.nodes[n].get('rating', 0) >= 0.6 and G.nodes[n].get('jumlah_ulasan', 0) >= 5
                ]
                
                print(f"[DEBUG] Jumlah nodes setelah filter utama: {len(filtered)}")

                # Tambahan cadangan kalau hasil terlalu sedikit
                if len(filtered) < required_count:
                    cadangan = [
                        n for n in nodes
                        if n not in filtered and
                        G.nodes[n].get('rating', 0) >= 0.4 and G.nodes[n].get('jumlah_ulasan', 0) >= 2
                    ]
                    filtered.extend(cadangan[:required_count - len(filtered)])
                    print(f"[DEBUG] Jumlah nodes setelah ditambah cadangan: {len(filtered)}")
                
                # Jika masih terlalu sedikit, tambahkan node apa saja
                if len(filtered) < required_count and nodes:
                    print(f"[WARN] Terlalu sedikit node yang memenuhi kriteria filter, menggunakan node apa saja")
                    remaining_nodes = [n for n in nodes if n not in filtered]
                    filtered.extend(remaining_nodes[:required_count - len(filtered)])
                    print(f"[DEBUG] Jumlah nodes setelah ditambah fallback: {len(filtered)}")
                
                # Jika masih belum cukup, duplikasi node yang ada (untuk memastikan selalu ada 5)
                if len(filtered) < required_count and filtered:
                    duplicates_needed = required_count - len(filtered)
                    duplicates = filtered[:duplicates_needed]
                    filtered.extend(duplicates)
                    print(f"[DEBUG] Jumlah nodes setelah duplikasi: {len(filtered)}")

                # Perbaikan: Handling distance calculation untuk node yang tidak terhubung langsung
                def final_score(x):
                    rating = G.nodes[x].get('rating', 0)
                    ulasan = np.log1p(G.nodes[x].get('jumlah_ulasan', 0))
                    
                    # Handling kasus tidak ada koneksi langsung
                    distance_penalty = 0
                    if hotel in G and x in G.neighbors(hotel):
                        distance_penalty = distance_weight * G[hotel][x].get('weight', 0)
                    
                    return rating_weight * rating + ulasan_weight * ulasan - distance_penalty

                sorted_nodes = sorted(
                    list(dict.fromkeys(filtered)),
                    key=final_score,
                    reverse=True
                )[:required_count]
                
                # Final check to ensure we have exactly required_count nodes
                if len(sorted_nodes) < required_count and sorted_nodes:
                    duplicates_needed = required_count - len(sorted_nodes)
                    sorted_nodes.extend(sorted_nodes[:duplicates_needed])
                
                print(f"[DEBUG] Jumlah nodes setelah sort dan limit: {len(sorted_nodes)}")
                return sorted_nodes

            wisata_terpilih = filter_and_sort(wisata_list, required_count=5)
            makan_terpilih = filter_and_sort(makan_list, required_count=5)

            all_candidates.append({
                "Akomodasi": hotel,
                "Tempat Wisata": wisata_terpilih,
                "Tempat Makan": makan_terpilih
            })

        print(f"\n=== Rekomendasi Paket Wisata yang Relevan (berdasarkan {mode}) ===")
        for i, paket in enumerate(all_candidates, 1):
            akomodasi = paket["Akomodasi"]
            r = G.nodes[akomodasi].get("rating", 0)
            u = G.nodes[akomodasi].get("jumlah_ulasan", 0)
            hotel_type = G.nodes[akomodasi].get('type', 'hotel')
            print(f"\n Paket Wisata {i}:")
            print(f"   Akomodasi: {akomodasi} (tipe: {hotel_type}, rating: {r:.1f}, ulasan: {int(u)})")

            print("   Tempat Wisata:")
            for wisata in paket["Tempat Wisata"]:
                r = G.nodes[wisata].get("rating", 0)
                u = G.nodes[wisata].get("jumlah_ulasan", 0)
                w = G[akomodasi][wisata].get("weight", 0) if akomodasi in G and wisata in G[akomodasi] else 0
                print(f"     - {wisata} (rating: {r:.1f}, ulasan: {int(u)}, bobot: {w:.4f})")

            print("   Tempat Makan:")
            for makan in paket["Tempat Makan"]:
                r = G.nodes[makan].get("rating", 0)
                u = G.nodes[makan].get("jumlah_ulasan", 0)
                w = G[akomodasi][makan].get("weight", 0) if akomodasi in G and makan in G[akomodasi] else 0
                print(f"     - {makan} (rating: {r:.1f}, ulasan: {int(u)}, bobot: {w:.4f})")

        return all_candidates
        
    except Exception as e:
        import traceback
        print(f"[FATAL ERROR] Terjadi kesalahan dalam generate_recommendation_core: {str(e)}")
        traceback.print_exc()
        return []
        

# --- Fungsi Ground Truth Berdasarkan Prioritas ---
def generate_ground_truth_rating(G, prefs, top_n=5):
    def skor(n):
        r = G.nodes[n].get('rating', 0)
        u = G.nodes[n].get('jumlah_ulasan', 0)
        return (r ** 2) * np.log1p(u)
    return get_top_ground_truth(G, prefs, skor, top_n)

def generate_ground_truth_distance(G, prefs, top_n=5):
    def skor(n):
        return sum(G[n][neigh].get('weight', 0) for neigh in G.neighbors(n))
    return get_top_ground_truth(G, prefs, skor, top_n)

def generate_ground_truth_combined(G, prefs, top_n=5):
    def skor(n):
        r = G.nodes[n].get('rating', 0)
        u = G.nodes[n].get('jumlah_ulasan', 0)
        w = sum(G[n][neigh].get('weight', 0) for neigh in G.neighbors(n))
        return 0.5 * ((r ** 2) * np.log1p(u)) + 0.5 * w
    return get_top_ground_truth(G, prefs, skor, top_n)


def get_top_ground_truth(G, prefs, score_func, top_n):
    try:
        kab_pref = prefs.get('kab_kota', '').lower()
        jenis_wisata = prefs.get('jenis_wisata', 'keduanya').lower()
        jenis_makan = prefs.get('jenis_makan', 'keduanya').lower()
        budget = prefs.get('budget_hotel', 'tinggi').lower()
        
        # Perbaikan: Filter untuk hotel dan penginapan
        if budget == 'tinggi':
            hotel_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'hotel' and 
                          (not kab_pref or kab_pref in G.nodes[n].get('kab_kota', '').lower())]
        else:
            # Untuk budget rendah, gunakan penginapan
            hotel_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'penginapan' and 
                          (not kab_pref or kab_pref in G.nodes[n].get('kab_kota', '').lower())]
        
        # Jika tidak ada hasil yang memenuhi kriteria, ambil hotel/penginapan apa saja
        if not hotel_nodes:
            print("[WARN] Ground Truth - Tidak ada akomodasi yang memenuhi kriteria, menggunakan semua akomodasi")
            hotel_nodes = [n for n in G.nodes if G.nodes[n]['type'] in ['hotel', 'penginapan']]
        
        # Filter tempat wisata
        if jenis_wisata == 'keduanya':
            wisata_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'wisata']
        else:
            nilai_wisata = 0.5 if jenis_wisata == 'alam' else 1.0
            wisata_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'wisata' and G.nodes[n].get('kategori_nilai') == nilai_wisata]
            
            # Fallback jika terlalu ketat
            if not wisata_nodes:
                wisata_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'wisata']
        
        # Filter tempat makan
        if jenis_makan == 'keduanya':
            makan_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'makan']
        else:
            nilai_makan = 0.5 if jenis_makan == 'halal' else 1.0
            makan_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'makan' and G.nodes[n].get('kategori_nilai') == nilai_makan]
            
            # Fallback jika terlalu ketat
            if not makan_nodes:
                makan_nodes = [n for n in G.nodes if G.nodes[n]['type'] == 'makan']

        # Pastikan semua nodes tidak kosong
        if not hotel_nodes:
            print("[ERROR] Ground Truth - Tidak ada akomodasi yang tersedia!")
            hotel_nodes = []
        if not wisata_nodes:
            print("[ERROR] Ground Truth - Tidak ada tempat wisata yang tersedia!")
            wisata_nodes = []
        if not makan_nodes:
            print("[ERROR] Ground Truth - Tidak ada tempat makan yang tersedia!")
            makan_nodes = []

        # Sort dan pilih top N
        try:
            hotel_gt = sorted(hotel_nodes, key=score_func, reverse=True)[:min(3, len(hotel_nodes))]
            wisata_gt = sorted(wisata_nodes, key=score_func, reverse=True)[:min(top_n, len(wisata_nodes))]
            makan_gt = sorted(makan_nodes, key=score_func, reverse=True)[:min(top_n, len(makan_nodes))]
        except Exception as e:
            print(f"[ERROR] Gagal mengurutkan ground truth: {str(e)}")
            hotel_gt = hotel_nodes[:min(3, len(hotel_nodes))]
            wisata_gt = wisata_nodes[:min(top_n, len(wisata_nodes))]
            makan_gt = makan_nodes[:min(top_n, len(makan_nodes))]

        # Log jumlah items untuk debugging
        print(f"[DEBUG] Ground Truth - Hotel: {len(hotel_gt)}, Wisata: {len(wisata_gt)}, Makan: {len(makan_gt)}")
        
        return hotel_gt + wisata_gt + makan_gt
        
    except Exception as e:
        import traceback
        print(f"[FATAL ERROR] Error dalam get_top_ground_truth: {str(e)}")
        traceback.print_exc()
        return []


def evaluate(recs, ground_truth):
    # Handling jika recs atau ground_truth kosong
    if not recs:
        print("[ERROR] Evaluasi - List rekomendasi kosong!")
    if not ground_truth:
        print("[ERROR] Evaluasi - List ground truth kosong!")
        
    if not recs or not ground_truth:
        return {'precision': 0.0, 'recall': 0.0, 'f1': 0.0, 'hit_rate': 0}

    tp = len(set(recs) & set(ground_truth))
    precision = tp / len(recs) if recs else 0.0
    recall = tp / len(ground_truth) if ground_truth else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    hit_rate = 1 if tp > 0 else 0

    print("\n=== Debug: Perbandingan Nama Rekomendasi vs Ground Truth ===")
    for item in recs:
        # Menambahkan informasi jenis entitas
        entity_type = "Unknown"
        if G.nodes[item]['type'] == 'hotel':
            entity_type = "Hotel"
        elif G.nodes[item]['type'] == 'penginapan':
            entity_type = "Penginapan"
        elif G.nodes[item]['type'] == 'makan':
            entity_type = "Tempat Makan"
        elif G.nodes[item]['type'] == 'wisata':
            entity_type = "Tempat Wisata"

        if item in ground_truth:
            print(f"[OK] {item} ({entity_type})")
        else:
            print(f"[NO] {item} ({entity_type})")

    return {'precision': precision, 'recall': recall, 'f1': f1, 'hit_rate': hit_rate}


# === EKSEKUSI UTAMA ===
try:
    print("\n=== Preferensi Pengguna ===")
    print(f"Kabupaten/Kota        : {user_preferences['kab_kota'].title()}")
    print(f"Preferensi Akomodasi  : {user_preferences.get('budget_hotel', 'Tidak spesifik').title()}")
    print(f"Preferensi Wisata     : {user_preferences.get('jenis_wisata', 'Tidak spesifik').title()}")
    print(f"Preferensi Tempat Makan : {user_preferences.get('jenis_makan', 'Tidak spesifik').title()}")
    print(f"Prioritas Rekomendasi : {user_preferences.get('prioritas', 'rating').title()}")

    prioritas = user_preferences.get("prioritas", "rating")

    if prioritas == "rating":
        paket_wisata = generate_recommendation_by_rating(G)
        top_ground_truth = generate_ground_truth_rating(G, user_preferences)
    elif prioritas == "jarak":
        paket_wisata = generate_recommendation_by_distance(G)
        top_ground_truth = generate_ground_truth_distance(G, user_preferences)
    else:
        paket_wisata = generate_recommendation_combined(G)
        top_ground_truth = generate_ground_truth_combined(G, user_preferences)

    # Cek apakah hasil rekomendasi valid
    if not paket_wisata:
        print("[ERROR] Tidak ada paket wisata yang dihasilkan!")
        all_recs = []
    else:
        # Ekstrak semua item dari paket wisata
        all_recs = []
        for paket in paket_wisata:
            all_recs.append(paket["Akomodasi"])
            all_recs.extend(paket["Tempat Wisata"])
            all_recs.extend(paket["Tempat Makan"])

    # Evaluasi hasil rekomendasi
    metrics = evaluate(all_recs, top_ground_truth)

    print("\n=== Evaluasi Sistem (Ground Truth Realistis) ===")
    print(f"\nPrecision : {metrics['precision']:.2f}")
    print(f"Recall    : {metrics['recall']:.2f}")
    print(f"F1-Score  : {metrics['f1']:.2f}")
    print(f"Hit Rate  : {metrics['hit_rate']}")
    
except Exception as e:
    import traceback
    print(f"\n[FATAL ERROR] Terjadi kesalahan tak terduga: {str(e)}")
    traceback.print_exc()


# Modifikasi pada fungsi generate_recommendation untuk digunakan di API
def generate_recommendation(user_preferences):
    try:
        # Ambil preferensi dari user yang diterima dari API
        print(f"Received preferences: {user_preferences}")

        # Filter data berdasarkan preferensi yang diterima
        hotel_filtered, wisata_filtered, makan_filtered = filter_data_by_preferences(
            hotel_df, alam_df, sejarah_df, makan_df, user_preferences
        )

        print(f"Filtered Hotels: {hotel_filtered.shape[0]}")
        print(f"Filtered Wisata: {wisata_filtered.shape[0]}")
        print(f"Filtered Makan: {makan_filtered.shape[0]}")

        # Perbaikan: Periksa hasil filtering
        if hotel_filtered.empty:
            print("[WARN] Tidak ada hotel yang sesuai dengan preferensi, menggunakan semua hotel")
            hotel_filtered = hotel_df
        if wisata_filtered.empty:
            print("[WARN] Tidak ada tempat wisata yang sesuai dengan preferensi, menggunakan semua tempat wisata")
            wisata_filtered = pd.concat([alam_df, sejarah_df])
        if makan_filtered.empty:
            print("[WARN] Tidak ada tempat makan yang sesuai dengan preferensi, menggunakan semua tempat makan")
            makan_filtered = makan_df

        # Menghitung relevansi berdasarkan preferensi pengguna
        relevance_df, hotel_strategic_score = calculate_relevance_with_preferences(
            hotel_filtered, wisata_filtered, makan_filtered, distance_df, user_preferences
        )

        print(f"Relevance DataFrame: {relevance_df.shape}")

        # Bangun knowledge graph berdasarkan data yang telah difilter dan relevansi yang dihitung
        G = build_knowledge_graph(hotel_filtered, wisata_filtered, makan_filtered, relevance_df)

        print(f"Knowledge Graph: Nodes = {G.number_of_nodes()}, Edges = {G.number_of_edges()}")

        # Pilih rekomendasi berdasarkan prioritas yang ditentukan (rating, jarak, atau keduanya)
        if user_preferences['prioritas'] == "rating":
            paket_wisata = generate_recommendation_by_rating(G)
        elif user_preferences['prioritas'] == "jarak":
            paket_wisata = generate_recommendation_by_distance(G)
        else:
            paket_wisata = generate_recommendation_combined(G)

        if not paket_wisata:
            return {"error": "Tidak dapat menemukan rekomendasi yang cocok dengan preferensi Anda."}

        print(f"Final Rekomendasi: {len(paket_wisata)} paket wisata dihasilkan")
        
        # Menambahkan rangking ke hasil rekomendasi
        for i, paket in enumerate(paket_wisata, 1):
            paket["Ranking"] = i
        
        return paket_wisata  # Mengembalikan hasil rekomendasi
        
    except Exception as e:
        import traceback
        error_msg = f"Error generating recommendation: {str(e)}"
        traceback.print_exc()
        return {"error": error_msg}