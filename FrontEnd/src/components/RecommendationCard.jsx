// src/components/RecommendationCard.jsx
export default function RecommendationCard({ paket, index, feedback, handleFeedback }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-400 p-4 text-white">
        <h3 className="text-xl font-bold">Rekomendasi #{index + 1}</h3>
        <p className="text-sm opacity-90">Pilihan terbaik berdasarkan kriteria Anda</p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        {/* Akomodasi */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">🏨 Akomodasi</h4>
          <p className="text-gray-600 pl-2">{paket.Akomodasi}</p>
        </div>

        {/* Wisata */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">🏞️ Destinasi Wisata</h4>
          <ul className="space-y-2 pl-2">
            {paket["Tempat Wisata"].map((w, i) => (
              <li
                key={i}
                className="bg-blue-50 p-3 rounded-md border border-blue-100 shadow-sm"
              >
                <h5 className="text-blue-800 font-semibold">{w.nama_tempat}</h5>
                <p className="text-sm text-gray-600">
                  ⭐ {w.rating} | 📍 {w.distance.toFixed(2)} km | 🗣️ {w.jumlah_ulasan} ulasan
                  <br />
                  🔗 Weight: {w.weight.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Makan */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">🍽️ Kuliner</h4>
          <ul className="space-y-2 pl-2">
            {paket["Tempat Makan"].map((m, i) => (
              <li
                key={i}
                className="bg-yellow-50 p-3 rounded-md border border-yellow-100 shadow-sm"
              >
                <h5 className="text-yellow-800 font-semibold">{m.nama_tempat}</h5>
                <p className="text-sm text-gray-600">
                  ⭐ {m.rating} | 📍 {m.distance.toFixed(2)} km | 🗣️ {m.jumlah_ulasan} ulasan
                  <br />
                  🔗 Weight: {m.weight.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Feedback */}
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-center space-x-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            feedback === "like"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-green-100"
          }`}
          onClick={() => handleFeedback(index, "like")}
          aria-label={`Like rekomendasi nomor ${index + 1}`}
        >
          👍 Suka
        </button>

        <button
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            feedback === "dislike"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-red-100"
          }`}
          onClick={() => handleFeedback(index, "dislike")}
          aria-label={`Dislike rekomendasi nomor ${index + 1}`}
        >
          👎 Tidak Suka
        </button>
      </div>
    </div>
  );
}
