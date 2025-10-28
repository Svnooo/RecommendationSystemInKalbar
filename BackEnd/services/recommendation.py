import random
import uuid
from datetime import datetime

import numpy as np
from config import RECOMMENDATION_COUNT
from connectors.neo4j_connector import neo4j_conn
from services.data_loader import haversine_distance


def exclude_used_places(nodes, used_places):
    """
    Mengeluarkan tempat yang telah digunakan sebelumnya untuk memastikan variasi
    """
    # Pastikan 'nodes' adalah list
    if not isinstance(nodes, list):
        raise TypeError(f"Expected nodes to be a list, but got {type(nodes)}")

    # Handle both list of strings and list of dictionaries
    if nodes and isinstance(nodes[0], dict):
        # List of dictionaries
        return [node for node in nodes if node['name'] not in used_places]
    else:
        # List of strings
        return [node for node in nodes if node not in used_places]

def weighted_random_sample(candidates, weights, k):
    """
    Sampling unik dari kandidat dengan bobot probabilitas, tanpa pengulangan.
    """
    assert len(candidates) == len(weights), "Length mismatch"

    chosen_names = set()
    results = []

    while len(results) < k and len(chosen_names) < len(candidates):
        selected = random.choices(candidates, weights=weights, k=1)[0]
        selected_name = selected.get('name') if isinstance(selected, dict) else selected
        if selected_name not in chosen_names:
            results.append(selected)
            chosen_names.add(selected_name)

    return results

def weighted_random_walk(start_node, target_type, kab_kota, min_count=5, prioritas='rating', used_places=None):
    if used_places is None:
        used_places = set()

    # Query untuk mendapatkan target(Node awal) berdasarkan relasi dalam graf
    query = """
    MATCH (start:Place {name: $start})
    OPTIONAL MATCH (start)-[r:RELEVANT_TO]->(target:Place)
    WHERE target.type = $type AND toLower(target.kab_kota) = toLower($kab_kota)
    RETURN target.name AS name, 
           target.rating AS rating, 
           target.jumlah_ulasan AS ulasan, 
           target.category AS category,
           r.weight AS weight,
           r.distance AS distance,
           target.latitude AS latitude,
           target.longitude AS longitude
    LIMIT 100
    """
    
    # Eksekusi query ke Neo4j
    result = neo4j_conn.query(query, {
        "start": start_node,
        "type": target_type,
        "kab_kota": kab_kota
    })

    # Membuat daftar nodes dengan properti yang dibutuhkan
    nodes = []
    for record in result:
        try:
            name = record.get('name')
            rating = float(record.get('rating', 0))
            ulasan = float(record.get('ulasan', 0))
            category = record.get('category', 'unknown')
            weight = float(record.get('weight', 1))
            distance = float(record.get('distance', float('inf')))
            latitude = float(record.get('latitude', 0))
            longitude = float(record.get('longitude', 0))
            
            # Perbaikan: quality_score berbanding lurus dengan rating dan log(ulasan)
            # Ini memastikan rating 4.8 dengan 100 ulasan lebih diprioritaskan daripada rating 5.0 dengan 10 ulasan
            quality_score = rating * np.log1p(ulasan)
            
            # Sesuaikan bobot berdasarkan prioritas
            if prioritas == 'rating':
                # Prioritas rating: 80% rating+ulasan, 20% jarak dalam bobot
                adjusted_weight = (0.8 * quality_score) + (0.2 * weight)
            elif prioritas == 'jarak':
                # PERBAIKAN: Jarak lebih prioritas, gunakan inverse distance
                # Semakin kecil jarak, semakin besar nilai 1/distance
                if distance > 0 and distance != float('inf'):
                    distance_score = 10 / distance  # Faktor pengali untuk memperbesar efek jarak
                else:
                    distance_score = 0.1  # Default jika jarak tidak diketahui
                
                # Prioritas jarak: 90% jarak, 10% rating+ulasan dalam bobot
                adjusted_weight = (0.9 * distance_score) + (0.1 * quality_score)
            else:
                # Prioritas seimbang: 50% rating+ulasan, 50% jarak dalam bobot
                if distance > 0 and distance != float('inf'):
                    distance_score = 1 / distance
                else:
                    distance_score = 0.1
                
                adjusted_weight = (0.5 * quality_score) + (0.5 * distance_score)
            
            nodes.append({
                "name": name, 
                "rating": rating, 
                "ulasan": ulasan,
                "category": category,
                "weight": adjusted_weight,
                "distance": distance,
                "quality_score": quality_score,
                "latitude": latitude,
                "longitude": longitude
            })
        except Exception as e:
            print(f"[ERROR] Error saat memproses node: {str(e)}")
            continue

    if len(nodes) < min_count:
            print(f"[DEBUG] Tidak cukup node untuk {target_type}, melakukan fallback...")
            # Query fallback tetap sama
            fallback_query = """
            MATCH (start:Place {name: $start})
            MATCH (t:Place)
            WHERE t.type = $type AND toLower(t.kab_kota) = toLower($kab_kota) 
            AND NOT t.name IN $exclude
            WITH start, t,
                CASE WHEN start.latitude IS NOT NULL AND t.latitude IS NOT NULL
                    THEN point.distance(point({latitude: start.latitude, longitude: start.longitude}), 
                                        point({latitude: t.latitude, longitude: t.longitude}))
                    ELSE 100000
                END as distance
            RETURN t.name AS name, 
                t.rating AS rating, 
                t.jumlah_ulasan AS ulasan,
                t.category AS category,
                t.latitude AS latitude,
                t.longitude AS longitude,
                distance/1000 AS distance
            ORDER BY CASE
                    WHEN $prioritas = 'jarak' THEN distance
                    WHEN $prioritas = 'rating' THEN -(t.rating * log10(t.jumlah_ulasan + 1))
                    ELSE (distance*0.5) - (t.rating * log10(t.jumlah_ulasan + 1)*0.5)
                    END ASC
            LIMIT $fill
            """

            extra = neo4j_conn.query(fallback_query, {
                "start": start_node,
                "type": target_type,
                "kab_kota": kab_kota,
                "exclude": [node['name'] for node in nodes],
                "fill": min_count - len(nodes),
                "prioritas": prioritas
            })

            # Siapkan pool fallback dan bobot
            fallback_pool = []
            fallback_weights = []

            for record in extra:
                try:
                    name = record.get('name')
                    rating = float(record.get('rating', 0))
                    ulasan = float(record.get('ulasan', 0))
                    category = record.get('category', 'unknown')
                    latitude = float(record.get('latitude', 0))
                    longitude = float(record.get('longitude', 0))
                    distance = float(record.get('distance', float('inf')))

                    quality_score = rating * np.log1p(ulasan)

                    if prioritas == 'rating':
                        adjusted_weight = quality_score
                    elif prioritas == 'jarak':
                        if distance > 0 and distance != float('inf'):
                            distance_score = 10 / distance
                        else:
                            distance_score = 0.1
                        adjusted_weight = (0.9 * distance_score) + (0.1 * quality_score)
                    else:
                        if distance > 0 and distance != float('inf'):
                            distance_score = 1 / distance
                        else:
                            distance_score = 0.1
                        adjusted_weight = (0.5 * quality_score) + (0.5 * distance_score)

                    fallback_pool.append({
                        "name": name,
                        "rating": rating,
                        "ulasan": ulasan,
                        "category": category,
                        "weight": adjusted_weight,
                        "distance": distance,
                        "quality_score": quality_score,
                        "latitude": latitude,
                        "longitude": longitude
                    })
                    fallback_weights.append(adjusted_weight)

                except Exception as e:
                    print(f"[ERROR] Error saat memproses fallback node: {str(e)}")
                    continue

            # Pilih fallback secara weighted random sampling dengan variasi kategori
            # Filter kategori agar fallback tidak monoton
            top_categories = set(node['category'] for node in nodes[:3])  # ambil kategori top 3
            filtered_pool = [node for node in fallback_pool if node['category'] not in top_categories]
            filtered_weights = [node['weight'] for node in filtered_pool]

            # Jika filter kategori mengurangi kandidat terlalu banyak, gunakan pool asli
            if len(filtered_pool) < (min_count - len(nodes)):
                filtered_pool = fallback_pool
                filtered_weights = fallback_weights

            fallback_selected = weighted_random_sample(filtered_pool, filtered_weights, min_count - len(nodes))

            # Tambahkan fallback yang dipilih ke nodes
            nodes.extend(fallback_selected)
    
    selected_nodes = []

    if prioritas == 'rating':
        # Implementasi baru untuk prioritas rating dengan variasi
        # Urutkan berdasarkan quality_score (rating + ulasan)
        nodes.sort(key=lambda x: (x['quality_score']), reverse=True)
        
        # Ambil top 3 berdasarkan rating tertinggi (untuk rekomendasi utama)
        top_3_places = nodes[:3]
        
        # Ambil kategori dari top 3 untuk memastikan variasi pada fallback
        top_categories = set(node['category'] for node in top_3_places)
        top_names = set(node['name'] for node in top_3_places)
        
        # Temukan fallback yang memiliki kategori berbeda dari top 3
        fallback_candidates = [node for node in nodes if node['name'] not in top_names]
        
        # Prioritaskan kategori yang berbeda untuk fallback
        fallback_nodes = []
        for node in fallback_candidates:
            if node['category'] not in top_categories and len(fallback_nodes) < 2:
                fallback_nodes.append(node)
        
        # Jika fallback dengan kategori berbeda tidak cukup, tambahkan fallback lain
        if len(fallback_nodes) < 2:
            additional_needed = 2 - len(fallback_nodes)
            remaining_candidates = [node for node in fallback_candidates 
                                   if node not in fallback_nodes]
            
            # Urutkan berdasarkan rating untuk fallback tambahan
            remaining_candidates.sort(key=lambda x: x['rating'], reverse=True)
            fallback_nodes.extend(remaining_candidates[:additional_needed])
        
        # Gabungkan top 3 dan fallback untuk hasil akhir
        selected_nodes = top_3_places + fallback_nodes
        
        # Log untuk debugging
        print(f"[INFO] Priority: {prioritas}, Selected Top 3:")
        for i, node in enumerate(top_3_places):
            print(f"  {i+1}. {node['name']} (R:{node['rating']}, U:{node['ulasan']}, Cat:{node['category']})")
        
        print(f"[INFO] Selected Fallbacks:")
        for i, node in enumerate(fallback_nodes):
            print(f"  {i+1}. {node['name']} (R:{node['rating']}, U:{node['ulasan']}, Cat:{node['category']})")

    elif prioritas == 'jarak':
        nodes.sort(key=lambda x: x['distance'] if x['distance'] != float('inf') else 999999)
        closest_count = max(int(min_count * 0.6), 3)
        closest_nodes = nodes[:closest_count]
        selected_nodes.extend(closest_nodes)

        remaining_nodes = [n for n in nodes[closest_count:] if n['distance'] < 15]
        remaining_nodes.sort(key=lambda x: x['quality_score'], reverse=True)

        used_categories = set([n['category'] for n in closest_nodes])
        varied_nodes = []

        for node in remaining_nodes:
            if len(varied_nodes) >= (min_count - closest_count):
                break
            if node['category'] not in used_categories:
                varied_nodes.append(node)
                used_categories.add(node['category'])

        if len(varied_nodes) < (min_count - closest_count):
            remaining_needed = min_count - closest_count - len(varied_nodes)
            for node in remaining_nodes:
                if node not in varied_nodes and len(varied_nodes) < remaining_needed:
                    varied_nodes.append(node)

        selected_nodes.extend(varied_nodes)

    else:  # kombinasi
        for node in nodes:
            distance = node['distance']
            quality_score = node['quality_score']
            distance_score = 1 / distance if distance > 0 and distance != float('inf') else 0.1
            node['combined_score'] = (0.5 * distance_score) + (0.5 * quality_score)

        nodes.sort(key=lambda x: x['combined_score'], reverse=True)

        if target_type in ['wisata', 'makan']:
            top_places = nodes[:3]
            top_categories = set(p['category'] for p in top_places)
            different_category = [n for n in nodes[3:] if n['category'] not in top_categories]

            if len(different_category) < 2:
                remaining = [n for n in nodes[3:] if n not in different_category]
                different_category.extend(remaining[:2 - len(different_category)])

            selected_nodes = top_places + different_category[:2]
        else:
            selected_nodes = nodes[:min_count]

    if len(selected_nodes) < min_count:
        remaining_count = min_count - len(selected_nodes)
        available_nodes = [n for n in nodes if n not in selected_nodes]

        if available_nodes:
            try:
                weights = [n['weight'] for n in available_nodes]
                additional_nodes = random.choices(available_nodes, weights=weights, k=remaining_count)
                selected_nodes.extend(additional_nodes)
            except Exception as e:
                print(f"[ERROR] Random selection error: {str(e)}")
                selected_nodes.extend(available_nodes[:remaining_count])

    seen = set()
    unique_selected = []
    for node in selected_nodes:
        if node['name'] not in seen:
            seen.add(node['name'])
            unique_selected.append(node)

    return unique_selected[:min_count]

def select_top_hotels_by_quality(kab_kota, min_n=3, max_n=5):
    """
    Memilih hotel berdasarkan rating dengan mempertimbangkan jumlah ulasan.
    Rating harus berbanding lurus dengan jumlah ulasan.
    """
    query = """
    MATCH (h:Place)
    WHERE h.type = 'hotel' AND toLower(h.kab_kota) = toLower($kab_kota)
    RETURN h.name AS name, h.rating AS rating, h.jumlah_ulasan AS ulasan
    """
    results = neo4j_conn.query(query, {"kab_kota": kab_kota})

    if not results:
        print(f"[WARN] Tidak ada hotel ditemukan di {kab_kota}")
        return []

    hotel_scores = {}
    for r in results:
        try:
            rating = float(r.get('rating', 0))
            ulasan = float(r.get('ulasan', 0))
            # Perbaikan: Skor yang memprioritaskan hotel dengan rating tinggi dan ulasan banyak
            # Rating 4.8 dengan 100 ulasan > rating 5.0 dengan 10 ulasan
            score = rating * np.log1p(ulasan)
            hotel_scores[r['name']] = score
        except Exception as e:
            print(f"[ERROR] Perhitungan skor hotel: {str(e)}")
            continue

    # Urutkan berdasarkan skor
    sorted_hotels = sorted(hotel_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Log top hotels untuk debugging
    print(f"[INFO] Top hotels by quality in {kab_kota}:")
    for i, (name, score) in enumerate(sorted_hotels[:5], 1):
        print(f"  {i}. {name} (score: {score:.2f})")
        
    return [name for name, _ in sorted_hotels[:max_n]]

def select_hotels_by_distance(kab_kota, min_n=3, max_n=5, top_places=None):
    """
    Memilih hotel berdasarkan jarak ke tempat wisata dan tempat makan populer
    """
    # PERBAIKAN: Ambil jumlah tempat wisata/makan lebih banyak untuk kalkulasi yang lebih akurat
    # Jika top_places tidak diberikan, dapatkan tempat wisata dan makan populer
    if not top_places:
        place_query = """
        MATCH (p:Place)
        WHERE p.type IN ['wisata', 'makan'] AND toLower(p.kab_kota) = toLower($kab_kota)
        AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
        RETURN p.name AS name, p.type AS type, p.rating AS rating, p.jumlah_ulasan AS ulasan,
               p.latitude AS lat, p.longitude AS lng
        ORDER BY p.rating * log10(p.jumlah_ulasan + 1) DESC
        LIMIT 15
        """
        top_places = neo4j_conn.query(place_query, {"kab_kota": kab_kota})
    
    # Pastikan ada tempat untuk dievaluasi
    if not top_places:
        print(f"[WARN] Tidak ada tempat wisata/makan populer di {kab_kota}")
        return select_top_hotels_by_quality(kab_kota, min_n, max_n)
    
    # Dapatkan semua hotel dengan koordinat
    hotel_query = """
    MATCH (h:Place)
    WHERE h.type = 'hotel' AND toLower(h.kab_kota) = toLower($kab_kota)
    AND h.latitude IS NOT NULL AND h.longitude IS NOT NULL
    RETURN h.name AS name, h.rating AS rating, h.jumlah_ulasan AS ulasan,
           h.latitude AS lat, h.longitude AS lng
    """
    hotels = neo4j_conn.query(hotel_query, {"kab_kota": kab_kota})
    
    if not hotels:
        print(f"[WARN] Tidak ada hotel ditemukan di {kab_kota}")
        return []
    
    # Hitung skor untuk setiap hotel berdasarkan jarak ke tempat populer
    scored_hotels = {}
    hotel_distances = {}  # Tambahkan untuk menyimpan jarak rata-rata
    
    for hotel in hotels:
        try:
            hotel_name = hotel['name']
            h_rating = float(hotel.get('rating', 0))
            h_ulasan = float(hotel.get('ulasan', 0))
            h_lat = float(hotel.get('lat', 0))
            h_lng = float(hotel.get('lng', 0))
            
            # Quality score untuk hotel
            quality_score = h_rating * np.log1p(h_ulasan)
            
            # Hitung jarak ke setiap tempat populer
            distances = []
            distance_details = []  # Untuk debugging
            
            for place in top_places:
                try:
                    p_lat = float(place.get('lat', 0))
                    p_lng = float(place.get('lng', 0))
                    place_name = place.get('name', 'Unknown')
                    place_type = place.get('type', 'Unknown')
                    
                    # Hitung jarak dengan Haversine
                    distance = haversine_distance(h_lat, h_lng, p_lat, p_lng)
                    distances.append(distance)
                    
                    # Simpan detail untuk debugging
                    distance_details.append({
                        'place': place_name,
                        'type': place_type,
                        'distance': distance
                    })
                except Exception as e:
                    print(f"[ERROR] Perhitungan jarak: {str(e)}")
                    continue
            
            # Jarak rata-rata ke tempat populer
            if distances:
                avg_distance = np.mean(distances)
                
                # PERBAIKAN: Hitung juga median dan minimal distance
                median_distance = np.median(distances)
                min_distance = min(distances)
                
                # PERBAIKAN: Gunakan formula yang lebih akurat untuk distance score
                # Berikan bobot lebih besar untuk min_distance (jarak ke tempat terdekat)
                # dan median_distance (yang tidak dipengaruhi outlier)
                distance_score = (0.4 / min_distance) + (0.4 / median_distance) + (0.2 / avg_distance)
                
                # Simpan jarak rata-rata untuk debugging
                hotel_distances[hotel_name] = {
                    'avg': avg_distance,
                    'median': median_distance,
                    'min': min_distance,
                    'details': distance_details
                }
            else:
                distance_score = 0.1  # Default jika tidak ada data jarak
                hotel_distances[hotel_name] = {
                    'avg': float('inf'),
                    'median': float('inf'),
                    'min': float('inf')
                }
            
            # PERBAIKAN: Skor final dengan penekanan lebih besar pada jarak
            # 95% jarak, 5% rating (prioritas jarak yang kuat)
            final_score = (0.95 * distance_score) + (0.05 * quality_score)
            
            scored_hotels[hotel_name] = final_score
        except Exception as e:
            print(f"[ERROR] Perhitungan skor hotel by distance: {str(e)}")
            continue
    
    # Urutkan hotel berdasarkan skor jarak
    sorted_hotels = sorted(scored_hotels.items(), key=lambda x: x[1], reverse=True)
    
    # Log top hotels untuk debugging dengan detail jarak
    print(f"[INFO] Top hotels by distance in {kab_kota}:")
    for i, (name, score) in enumerate(sorted_hotels[:min(5, len(sorted_hotels))], 1):
        distances = hotel_distances.get(name, {})
        avg_dist = distances.get('avg', float('inf'))
        median_dist = distances.get('median', float('inf'))
        min_dist = distances.get('min', float('inf'))
        print(f"  {i}. {name} (score: {score:.2f}, avg_dist: {avg_dist:.2f}km, median: {median_dist:.2f}km, min: {min_dist:.2f}km)")
        
        # Print detail jarak ke beberapa tempat populer untuk debugging
        details = distances.get('details', [])
        if details:
            print(f"     Jarak ke tempat populer:")
            for d in sorted(details, key=lambda x: x['distance'])[:3]:  # Tampilkan 3 terdekat
                print(f"       - {d['place']} ({d['type']}): {d['distance']:.2f}km")
    
    return [name for name, _ in sorted_hotels[:max_n]]

def select_hotels_by_mixed_criteria(kab_kota, min_n=3, max_n=5):
    """
    Memilih hotel berdasarkan kombinasi rating dan jarak seimbang.
    """
    # Dapatkan tempat wisata dan makan populer untuk evaluasi jarak
    place_query = """
    MATCH (p:Place)
    WHERE p.type IN ['wisata', 'makan'] AND toLower(p.kab_kota) = toLower($kab_kota)
    RETURN p.name AS name, p.type AS type, p.rating AS rating, p.jumlah_ulasan AS ulasan,
           p.latitude AS lat, p.longitude AS lng
    ORDER BY p.rating * log10(p.jumlah_ulasan + 1) DESC
    LIMIT 10
    """
    top_places = neo4j_conn.query(place_query, {"kab_kota": kab_kota})
    
    # Dapatkan hotel dengan rating dan lokasi
    hotel_query = """
    MATCH (h:Place)
    WHERE h.type = 'hotel' AND toLower(h.kab_kota) = toLower($kab_kota)
    RETURN h.name AS name, h.rating AS rating, h.jumlah_ulasan AS ulasan, 
           h.latitude AS lat, h.longitude AS lng
    """
    hotels = neo4j_conn.query(hotel_query, {"kab_kota": kab_kota})
    
    if not hotels:
        print(f"[WARN] Tidak ada hotel ditemukan di {kab_kota}")
        return []
    
    # Hitung skor hotel berdasarkan rating dan jarak ke tempat populer
    hotel_scores = {}
    for hotel in hotels:
        try:
            hotel_name = hotel['name']
            h_rating = float(hotel.get('rating', 0))
            h_ulasan = float(hotel.get('ulasan', 0))
            h_lat = float(hotel.get('lat', 0))
            h_lng = float(hotel.get('lng', 0))
            
            # Quality score untuk hotel (rating * log(ulasan+1))
            quality_score = h_rating * np.log1p(h_ulasan)
            
            # Hitung jarak ke tempat populer jika ada data tempat
            if top_places:
                distances = []
                for place in top_places:
                    try:
                        p_lat = float(place.get('lat', 0))
                        p_lng = float(place.get('lng', 0))
                        
                        # Hitung jarak dengan Haversine
                        distance = haversine_distance(h_lat, h_lng, p_lat, p_lng)
                        distances.append(distance)
                    except Exception as e:
                        print(f"[ERROR] Perhitungan jarak: {str(e)}")
                        continue
                
                # Jarak rata-rata ke tempat populer
                if distances:
                    avg_distance = np.mean(distances)
                    # Convert jarak ke skor (jarak kecil = skor tinggi)
                    if avg_distance > 0:
                        distance_score = 1 / avg_distance
                    else:
                        distance_score = 1.0  # Jarak sangat dekat
                else:
                    distance_score = 0.1  # Default jika tidak ada data jarak
            else:
                # Jika tidak ada data tempat, hanya gunakan rating
                distance_score = 0.5  # Nilai default seimbang
            
            # Skor final: 50% rating, 50% jarak (benar-benar seimbang)
            final_score = (0.5 * quality_score) + (0.5 * distance_score)
            
            hotel_scores[hotel_name] = final_score
        except Exception as e:
            print(f"[ERROR] Perhitungan skor hotel kombinasi: {str(e)}")
            continue
    
    # Urutkan hotel berdasarkan skor akhir
    sorted_hotels = sorted(hotel_scores.items(), key=lambda x: x[1], reverse=True)
    
    # Log top hotels untuk debugging
    print(f"[INFO] Top hotels by mixed criteria in {kab_kota}:")
    for i, (name, score) in enumerate(sorted_hotels[:5], 1):
        print(f"  {i}. {name} (score: {score:.2f})")
    
    return [name for name, _ in sorted_hotels[:max_n]]


def generate_recommendation_core(kab_kota, prioritas='rating', jumlah_paket=5, min_count=None, max_count=None):

    if min_count is None:
        min_count = max(3, min(jumlah_paket, 5))
    if max_count is None:
        max_count = jumlah_paket

    all_packages = []
    used_wisata = set()
    used_makan = set()

    print(f"[INFO] Menghasilkan rekomendasi berdasarkan prioritas: {prioritas}")

    if prioritas == 'rating':
        print("[INFO] Memilih hotel berdasarkan rating...")
        selected_hotels = select_top_hotels_by_quality(kab_kota, min_count, max_count)
    elif prioritas == 'jarak':
        print("[INFO] Memilih hotel berdasarkan jarak...")
        selected_hotels = select_hotels_by_distance(kab_kota, min_count, max_count)
    else:
        print("[INFO] Memilih hotel berdasarkan kombinasi rating dan jarak...")
        selected_hotels = select_hotels_by_mixed_criteria(kab_kota, min_count, max_count)

    if not selected_hotels:
        print(f"[ERROR] Tidak bisa mendapatkan hotel untuk {kab_kota}")
        return []

    top_wisata = []
    top_makan = []

    if prioritas == 'rating':
        top_wisata_query = """
        MATCH (p:Place)
        WHERE p.type = 'wisata' AND toLower(p.kab_kota) = toLower($kab_kota)
        RETURN p.name AS name, p.rating AS rating, p.jumlah_ulasan AS ulasan,
               p.category AS category, p.latitude AS lat, p.longitude AS lng
        ORDER BY p.rating * log10(p.jumlah_ulasan + 1) DESC
        LIMIT 15
        """
        top_wisata_results = neo4j_conn.query(top_wisata_query, {"kab_kota": kab_kota})
        for record in top_wisata_results:
            try:
                name = record.get('name')
                rating = float(record.get('rating', 0))
                ulasan = float(record.get('ulasan', 0))
                category = record.get('category', 'unknown')
                lat = float(record.get('lat', 0))
                lng = float(record.get('lng', 0))
                quality_score = rating * np.log1p(ulasan)
                top_wisata.append({
                    "name": name,
                    "rating": rating,
                    "ulasan": ulasan,
                    "category": category,
                    "quality_score": quality_score,
                    "latitude": lat,
                    "longitude": lng
                })
            except Exception as e:
                print(f"[ERROR] Error saat memproses top wisata: {str(e)}")
        top_wisata.sort(key=lambda x: x['quality_score'], reverse=True)

        top_makan_query = """
        MATCH (p:Place)
        WHERE p.type = 'makan' AND toLower(p.kab_kota) = toLower($kab_kota)
        RETURN p.name AS name, p.rating AS rating, p.jumlah_ulasan AS ulasan,
               p.category AS category, p.latitude AS lat, p.longitude AS lng
        ORDER BY p.rating * log10(p.jumlah_ulasan + 1) DESC
        LIMIT 20
        """
        top_makan_results = neo4j_conn.query(top_makan_query, {"kab_kota": kab_kota})
        for record in top_makan_results:
            try:
                name = record.get('name')
                rating = float(record.get('rating', 0))
                ulasan = float(record.get('ulasan', 0))
                category = record.get('category', 'unknown')
                lat = float(record.get('lat', 0))
                lng = float(record.get('lng', 0))
                quality_score = rating * np.log1p(ulasan)
                top_makan.append({
                    "name": name,
                    "rating": rating,
                    "ulasan": ulasan,
                    "category": category,
                    "quality_score": quality_score,
                    "latitude": lat,
                    "longitude": lng
                })
            except Exception as e:
                print(f"[ERROR] Error saat memproses top makan: {str(e)}")
        top_makan.sort(key=lambda x: x['quality_score'], reverse=True)

        print("[INFO] Top wisata berdasarkan rating + ulasan:")
        for i, w in enumerate(top_wisata[:5]):
            print(f"  {i+1}. {w['name']} (Rating: {w['rating']}, Ulasan: {w['ulasan']}, Score: {w['quality_score']:.2f})")

        print("[INFO] Top makan berdasarkan rating + ulasan:")
        for i, m in enumerate(top_makan[:5]):
            print(f"  {i+1}. {m['name']} (Rating: {m['rating']}, Ulasan: {m['ulasan']}, Score: {m['quality_score']:.2f})")

    for i, hotel in enumerate(selected_hotels):
        package = {"Akomodasi": hotel, "ranking": i + 1}
        package["recommendation_id"] = str(uuid.uuid4())

        hotel_coords_query = """
        MATCH (h:Place {name: $hotel})
        RETURN h.latitude AS lat, h.longitude AS lng
        """
        hotel_coords = neo4j_conn.query(hotel_coords_query, {"hotel": hotel})
        h_lat, h_lng = 0, 0
        if hotel_coords:
            h_lat = float(hotel_coords[0].get('lat', 0))
            h_lng = float(hotel_coords[0].get('lng', 0))

        wisata_recommendations = []
        makan_recommendations = []

        available_top_wisata = [w for w in top_wisata if w['name'] not in used_wisata]

        # Isi wisata rekomendasi awal
        for j in range(min(3, len(available_top_wisata))):
            w = available_top_wisata[j]
            dist = haversine_distance((h_lat, h_lng), (w['latitude'], w['longitude']))
            weight = 0.8 * w['quality_score'] + 0.2 * (1 / dist if dist > 0 else 0.1)
            wisata_recommendations.append({
                'nama_tempat': w['name'],
                'rating': w['rating'],
                'distance': dist,
                'jumlah_ulasan': w['ulasan'],
                'weight': weight
            })
            used_wisata.add(w['name'])

        fallback_needed_wisata = 3 - len(wisata_recommendations)

        # Fallback wisata dua tahap (exclude dulu, lalu tanpa exclude)
        fallback_wisata_query_with_exclude = """
        MATCH (h:Place {name: $hotel})
        MATCH (w:Place)
        WHERE w.type = 'wisata' AND toLower(w.kab_kota) = toLower($kab_kota)
        AND NOT w.name IN $exclude
        WITH h, w,
             CASE WHEN h.latitude IS NOT NULL AND w.latitude IS NOT NULL
                  THEN point.distance(point({latitude: h.latitude, longitude: h.longitude}),
                                      point({latitude: w.latitude, longitude: w.longitude}))
                  ELSE 100000
             END as distance
        RETURN w.name AS name, w.rating AS rating, w.jumlah_ulasan AS ulasan,
               w.category AS category, distance/1000 AS distance
        ORDER BY w.rating * log10(w.jumlah_ulasan + 1) DESC, distance ASC
        LIMIT 50
        """

        fallback_wisata_query_without_exclude = """
        MATCH (h:Place {name: $hotel})
        MATCH (w:Place)
        WHERE w.type = 'wisata' AND toLower(w.kab_kota) = toLower($kab_kota)
        WITH h, w,
             CASE WHEN h.latitude IS NOT NULL AND w.latitude IS NOT NULL
                  THEN point.distance(point({latitude: h.latitude, longitude: h.longitude}),
                                      point({latitude: w.latitude, longitude: w.longitude}))
                  ELSE 100000
             END as distance
        RETURN w.name AS name, w.rating AS rating, w.jumlah_ulasan AS ulasan,
               w.category AS category, distance/1000 AS distance
        ORDER BY w.rating * log10(w.jumlah_ulasan + 1) DESC, distance ASC
        LIMIT 50
        """

        fallback_results = neo4j_conn.query(fallback_wisata_query_with_exclude, {
            "hotel": hotel,
            "kab_kota": kab_kota,
            "exclude": list(used_wisata)
        })

        if len(fallback_results) < fallback_needed_wisata:
            fallback_results += neo4j_conn.query(fallback_wisata_query_without_exclude, {
                "hotel": hotel,
                "kab_kota": kab_kota,
            })

        fallback_wisata = []
        for record in fallback_results:
            try:
                name = record.get('name')
                rating = float(record.get('rating', 0))
                ulasan = float(record.get('ulasan', 0))
                category = record.get('category', 'unknown')
                distance = float(record.get('distance', float('inf')))
                quality_score = rating * np.log1p(ulasan)
                weight = 0.7 * quality_score + 0.3 * (1 / distance if distance > 0 else 0.1)
                fallback_wisata.append({
                    'nama_tempat': name,
                    'rating': rating,
                    'distance': distance,
                    'category': category,
                    'jumlah_ulasan': ulasan,
                    'weight': weight
                })
            except Exception as e:
                print(f"[ERROR] Error saat memproses fallback wisata: {str(e)}")

        if fallback_wisata and fallback_needed_wisata > 0:
            random.shuffle(fallback_wisata)
            selected_fallbacks = []
            wisata_nama_di_paket = set([rec['nama_tempat'] for rec in wisata_recommendations])
            for w in fallback_wisata:
                if len(selected_fallbacks) >= fallback_needed_wisata:
                    break
                if w['nama_tempat'] not in wisata_nama_di_paket:
                    selected_fallbacks.append(w)
                    wisata_nama_di_paket.add(w['nama_tempat'])
            if len(selected_fallbacks) < fallback_needed_wisata:
                for w in fallback_wisata:
                    if len(selected_fallbacks) >= fallback_needed_wisata:
                        break
                    if w not in selected_fallbacks:
                        selected_fallbacks.append(w)
            for fallback in selected_fallbacks:
                wisata_recommendations.append({
                    'nama_tempat': fallback['nama_tempat'],
                    'rating': fallback['rating'],
                    'distance': fallback['distance'],
                    'jumlah_ulasan': fallback['jumlah_ulasan'],
                    'weight': fallback['weight']
                })
                used_wisata.add(fallback['nama_tempat'])

        # Makan rekomendasi awal
        available_top_makan = [m for m in top_makan if m['name'] not in used_makan]
        for j in range(min(3, len(available_top_makan))):
            m = available_top_makan[j]
            dist = haversine_distance((h_lat, h_lng), (m['latitude'], m['longitude']))
            weight = 0.8 * m['quality_score'] + 0.2 * (1 / dist if dist > 0 else 0.1)
            makan_recommendations.append({
                'nama_tempat': m['name'],
                'rating': m['rating'],
                'distance': dist,
                'jumlah_ulasan': m['ulasan'],
                'weight': weight
            })
            used_makan.add(m['name'])

        fallback_needed_makan = 5 - len(makan_recommendations)

        fallback_makan_query_with_exclude = """
        MATCH (h:Place {name: $hotel})
        MATCH (m:Place)
        WHERE m.type = 'makan' AND toLower(m.kab_kota) = toLower($kab_kota)
        AND NOT m.name IN $exclude
        WITH h, m,
             CASE WHEN h.latitude IS NOT NULL AND m.latitude IS NOT NULL
                  THEN point.distance(point({latitude: h.latitude, longitude: h.longitude}),
                                      point({latitude: m.latitude, longitude: m.longitude}))
                  ELSE 100000
             END as distance
        RETURN m.name AS name, m.rating AS rating, m.jumlah_ulasan AS ulasan,
               m.category AS category, distance/1000 AS distance
        ORDER BY m.rating * log10(m.jumlah_ulasan + 1) DESC, distance ASC
        LIMIT 50
        """

        fallback_makan_query_without_exclude = """
        MATCH (h:Place {name: $hotel})
        MATCH (m:Place)
        WHERE m.type = 'makan' AND toLower(m.kab_kota) = toLower($kab_kota)
        WITH h, m,
             CASE WHEN h.latitude IS NOT NULL AND m.latitude IS NOT NULL
                  THEN point.distance(point({latitude: h.latitude, longitude: h.longitude}),
                                      point({latitude: m.latitude, longitude: m.longitude}))
                  ELSE 100000
             END as distance
        RETURN m.name AS name, m.rating AS rating, m.jumlah_ulasan AS ulasan,
               m.category AS category, distance/1000 AS distance
        ORDER BY m.rating * log10(m.jumlah_ulasan + 1) DESC, distance ASC
        LIMIT 50
        """

        fallback_results = neo4j_conn.query(fallback_makan_query_with_exclude, {
            "hotel": hotel,
            "kab_kota": kab_kota,
            "exclude": list(used_makan)
        })

        if len(fallback_results) < fallback_needed_makan:
            fallback_results += neo4j_conn.query(fallback_makan_query_without_exclude, {
                "hotel": hotel,
                "kab_kota": kab_kota,
            })

        fallback_makan = []
        for record in fallback_results:
            try:
                name = record.get('name')
                rating = float(record.get('rating', 0))
                ulasan = float(record.get('ulasan', 0))
                category = record.get('category', 'unknown')
                distance = float(record.get('distance', float('inf')))
                quality_score = rating * np.log1p(ulasan)
                weight = 0.7 * quality_score + 0.3 * (1 / distance if distance > 0 else 0.1)
                fallback_makan.append({
                    'nama_tempat': name,
                    'rating': rating,
                    'distance': distance,
                    'category': category,
                    'jumlah_ulasan': ulasan,
                    'weight': weight
                })
            except Exception as e:
                print(f"[ERROR] Error saat memproses fallback makan: {str(e)}")

        if fallback_makan and fallback_needed_makan > 0:
            random.shuffle(fallback_makan)
            selected_fallbacks = []
            makan_nama_di_paket = set([rec['nama_tempat'] for rec in makan_recommendations])
            for m in fallback_makan:
                if len(selected_fallbacks) >= fallback_needed_makan:
                    break
                if m['nama_tempat'] not in makan_nama_di_paket:
                    selected_fallbacks.append(m)
                    makan_nama_di_paket.add(m['nama_tempat'])
            if len(selected_fallbacks) < fallback_needed_makan:
                for m in fallback_makan:
                    if len(selected_fallbacks) >= fallback_needed_makan:
                        break
                    if m not in selected_fallbacks:
                        selected_fallbacks.append(m)
            for fallback in selected_fallbacks:
                makan_recommendations.append({
                    'nama_tempat': fallback['nama_tempat'],
                    'rating': fallback['rating'],
                    'distance': fallback['distance'],
                    'jumlah_ulasan': fallback['jumlah_ulasan'],
                    'weight': fallback['weight']
                })
                used_makan.add(fallback['nama_tempat'])

        package["Tempat Wisata"] = wisata_recommendations
        package["Tempat Makan"] = makan_recommendations

        print(f"[INFO] Paket {i+1} untuk hotel '{hotel}' (prioritas: {prioritas}): Wisata ({len(wisata_recommendations)}), Makan ({len(makan_recommendations)})")

        package["Ranking"] = i + 1
        all_packages.append(package)

        if len(all_packages) >= jumlah_paket:
            break

    print(f"[INFO] Berhasil menghasilkan {len(all_packages)} paket wisata dengan komposisi 1 akomodasi, 3 wisata, 5 makan")
    return all_packages
