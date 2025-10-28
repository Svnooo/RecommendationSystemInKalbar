import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PreferenceList() {
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:9000/admin/preferences")
      .then(res => {
        setPrefs(res.data);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(() => {
        setError("Gagal memuat daftar preferensi");
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(prefs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrefs = prefs.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Memuat data preferensi...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-3 py-1">ID</th>
            <th className="border border-gray-300 px-3 py-1">Username</th>
            <th className="border border-gray-300 px-3 py-1">Kab/Kota</th>
            <th className="border border-gray-300 px-3 py-1">Wisata</th>
            <th className="border border-gray-300 px-3 py-1">Makan</th>
            <th className="border border-gray-300 px-3 py-1">Hotel</th>
            <th className="border border-gray-300 px-3 py-1">Prioritas</th>
            <th className="border border-gray-300 px-3 py-1">Paket</th>
            <th className="border border-gray-300 px-3 py-1">Waktu</th>
          </tr>
        </thead>
        <tbody>
          {currentPrefs.map(pref => (
            <tr key={pref.id} className="text-center">
              <td className="border border-gray-300 px-3 py-1">{pref.id}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.username}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.kab_kota}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jenis_wisata}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jenis_makan}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.budget_hotel}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.prioritas}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jumlah_paket}</td>
              <td className="border border-gray-300 px-3 py-1">{new Date(pref.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-3 py-1 rounded ${currentPage === pageNum ? "bg-teal-600 text-white" : "bg-gray-200"}`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </>
  );
}
