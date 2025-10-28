// src/pages/RecommendationForm.jsx
import axios from 'axios';
import { useState } from 'react';
import RecommendationCard from '../components/RecommendationCard';
import CircularProgress from '../components/Loading';

export default function RecommendationForm() {
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    kab_kota: '',
    budget_hotel: 'tinggi',
    jenis_wisata: 'alam',
    jenis_makan: 'halal',
    prioritas: 'rating',
    jumlah_paket: 3,
  });
  const [feedback, setFeedback] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        'http://127.0.0.1:9000/recommend',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data.rekomendasi);
      setFeedback({});
    } catch (err) {
      console.error('Error fetching recommendation:', err);
      alert('Gagal fetch rekomendasi');
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (index, type) => {
    setFeedback({ ...feedback, [index]: type });
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Anda belum login. Silakan login terlebih dahulu.');
      return;
    }

    const recommendation_id = result[index]?.recommendation_id;

    if (!recommendation_id) {
      alert('Rekomendasi tidak valid, coba lagi.');
      return;
    }

    try {
      await axios.post(
        'http://127.0.0.1:9000/feedback/',
        { recommendation_id, feedback: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`Feedback ${type} berhasil dikirim untuk rekomendasi ${recommendation_id}`);
    } catch (error) {
      console.error('Gagal mengirim feedback:', error);
      alert('Gagal mengirim feedback, coba lagi.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kabupaten/Kota */}
            <div>
              <label htmlFor="kab_kota" className="block text-lg font-medium mb-2">
                Pilih Kabupaten/Kota
              </label>
              <select
                id="kab_kota"
                name="kab_kota"
                value={formData.kab_kota}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Pilih Kabupaten/Kota</option>
                <option value="singkawang">Singkawang</option>
                <option value="pontianak">Pontianak</option>
                <option value="sintang">Sintang</option>
                <option value="sekadau">Sekadau</option>
                <option value="sanggau">Sanggau</option>
                <option value="landak">Landak</option>
                <option value="melawi">Melawi</option>
                <option value="kapuas hulu">Kapuas Hulu</option>
                <option value="mempawah">Mempawah</option>
                <option value="kubu raya">Kubu Raya</option>
                <option value="kayong utara">Kayong Utara</option>
                <option value="sambas">Sambas</option>
                <option value="ketapang">Ketapang</option>
                <option value="bengkayang">Bengkayang</option>
              </select>
            </div>

            {/* Jenis Makanan */}
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full">
                <label className="block text-lg font-medium mb-2">Jenis Makanan</label>
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="jenis_makan"
                      value="halal"
                      checked={formData.jenis_makan === 'halal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Halal
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jenis_makan"
                      value="non-halal"
                      checked={formData.jenis_makan === 'non-halal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Non-Halal
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jenis_makan"
                      value="keduanya"
                      checked={formData.jenis_makan === 'keduanya'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Keduanya
                  </label>
                </div>
              </div>

              {/* Jenis Wisata */}
              <div className="w-full">
                <label className="block text-lg font-medium mb-2">Jenis Wisata</label>
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="jenis_wisata"
                      value="alam"
                      checked={formData.jenis_wisata === 'alam'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Alam
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jenis_wisata"
                      value="sejarah"
                      checked={formData.jenis_wisata === 'sejarah'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Sejarah
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="jenis_wisata"
                      value="keduanya"
                      checked={formData.jenis_wisata === 'keduanya'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Keduanya
                  </label>
                </div>
              </div>
            </div>

            {/* Budget Hotel */}
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full">
                <label className="block text-lg font-medium mb-2">Budget Hotel</label>
                <div className="flex items-center space-x-4">
                  <label>
                    <input
                      type="radio"
                      name="budget_hotel"
                      value="tinggi"
                      checked={formData.budget_hotel === 'tinggi'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Tinggi
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="budget_hotel"
                      value="rendah"
                      checked={formData.budget_hotel === 'rendah'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Rendah
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="budget_hotel"
                      value="keduanya"
                      checked={formData.budget_hotel === 'keduanya'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    Keduanya
                  </label>
                </div>
              </div>
            </div>

            {/* Prioritas Pencarian */}
            <div>
              <label className="block text-lg font-medium mb-2">Prioritas Pencarian</label>
              <div className="flex items-center space-x-4">
                <label>
                  <input
                    type="radio"
                    name="prioritas"
                    value="rating"
                    checked={formData.prioritas === 'rating'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Rating
                </label>
                <label>
                  <input
                    type="radio"
                    name="prioritas"
                    value="jarak"
                    checked={formData.prioritas === 'jarak'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Jarak
                </label>
                <label>
                  <input
                    type="radio"
                    name="prioritas"
                    value="keduanya"
                    checked={formData.prioritas === 'keduanya'}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  Keduanya
                </label>
              </div>
            </div>

            {/* Jumlah Paket Rekomendasi */}
            <div>
              <label className="block text-lg font-medium mb-2">Jumlah Paket Rekomendasi</label>
              <div className="flex flex-wrap items-center gap-4">
                {[3, 5, 10, 15].map((jumlah) => (
                  <label key={jumlah} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="jumlah_paket"
                      value={jumlah}
                      checked={formData.jumlah_paket === jumlah}
                      onChange={() => setFormData({ ...formData, jumlah_paket: jumlah })}
                      className="form-radio text-blue-500 mr-2"
                    />
                    {jumlah} Paket
                  </label>
                ))}
              </div>
            </div>
            <button
          type="submit"
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-blue-600 hover:to-teal-500 transition duration-300 font-semibold shadow-md"
          disabled={isLoading}
        >
          {isLoading ? 'Sedang Mencari...' : 'Cari Rekomendasi'}
        </button>
      </form>

      {isLoading && <CircularProgress />}

      {result && result.length > 0 && !isLoading && (
        <div className="mt-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-blue-800 mb-3">Rekomendasi Paket Wisata</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berikut adalah pilihan tempat menginap, wisata, dan makan terbaik berdasarkan preferensi Anda.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {result.map((paket, index) => (
              <RecommendationCard
                key={index}
                paket={paket}
                index={index}
                feedback={feedback[index]}
                handleFeedback={handleFeedback}
              />
            ))}
          </div>
        </div>
      )}

      {result && result.length === 0 && !isLoading && (
        <div className="mt-8 text-center py-10">
          <div className="text-5xl mb-4">😢</div>
          <p className="text-xl text-gray-600">Tidak ada hasil rekomendasi yang ditemukan.</p>
          <p className="text-gray-500 mt-2">Silakan coba dengan kriteria pencarian yang berbeda.</p>
        </div>
      )}
    </div>
  );
}
