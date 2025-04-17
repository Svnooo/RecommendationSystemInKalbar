import axios from 'axios';
import { useState } from 'react';

export default function RecommendationForm() {
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    kab_kota: '',
    budget_hotel: 'tinggi',
    jenis_wisata: 'alam',
    jenis_makan: 'halal',
    prioritas: 'rating'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:9000/recommend', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });      
  
      // Cek apakah respons diterima
      console.log("Response from backend:", res.data);
  
      // Set hasil ke state jika respons berhasil
      setResult(res.data.rekomendasi);
    } catch (err) {
      console.error("Error fetching recommendation:", err);
      alert("Gagal fetch rekomendasi");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Input */}
        <div>
          <label htmlFor="kab_kota" className="block text-lg font-medium mb-2">Pilih Kabupaten/Kota</label>
          <select
            id="kab_kota"
            name="kab_kota"
            value={formData.kab_kota}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Pilih Kabupaten/Kota</option>
            <option value="singkawang">Singkawang</option>
            <option value="pontianak">Pontianak</option>
            <option value="sintang">Sintang</option>
            <option value="sekadau">Sekadau</option>
            <option value="sanggau">Sanggau</option>
            <option value="landak">Landak</option>
            <option value="Melawi">melawi</option>
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
                  checked={formData.jenis_makan === "halal"}
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
                  checked={formData.jenis_makan === "non-halal"}
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
                  checked={formData.jenis_makan === "keduanya"}
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
                  checked={formData.jenis_wisata === "alam"}
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
                  checked={formData.jenis_wisata === "sejarah"}
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
                  checked={formData.jenis_wisata === "keduanya"}
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
                  checked={formData.budget_hotel === "tinggi"}
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
                  checked={formData.budget_hotel === "rendah"}
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
                  checked={formData.budget_hotel === "keduanya"}
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
                checked={formData.prioritas === "rating"}
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
                checked={formData.prioritas === "jarak"}
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
                checked={formData.prioritas === "keduanya"}
                onChange={handleChange}
                className="mr-2"
              />
              Keduanya
            </label>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Cari Rekomendasi
        </button>
      </form>

      {/* Menampilkan Hasil Rekomendasi */}
{result && result.length > 0 ? (
  <div className="mt-8">
    <h3 className="text-2xl font-semibold text-center mb-4">Hasil Rekomendasi</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {result.map((item, index) => (
        <div key={index} className="bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-lg p-6 hover:shadow-xl transition duration-300">
          <h4 className="text-xl font-semibold text-white mb-2">Rekomendasi {index + 1}</h4>
          <div className="text-white space-y-2">
            {/* Akomodasi */}
            <p><strong>Akomodasi:</strong> {item.Akomodasi}</p>
            <div>
              <strong>Tempat Wisata:</strong>
              {item['Tempat Wisata'].map((wisata, idx) => (
                <p key={idx}>- {wisata}</p>
              ))}
            </div>
            <div>
              <strong>Tempat Makan:</strong>
              {item['Tempat Makan'].map((makan, idx) => (
                <p key={idx}>- {makan}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  result && <p className="text-center text-lg text-gray-500 mt-4">Tidak ada hasil rekomendasi yang ditemukan.</p>
)}

    </div>
  );
}