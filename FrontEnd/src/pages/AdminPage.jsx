import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null); // id user yang sedang dihapus
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:9000/admin/users");
      setUsers(res.data);
      setCurrentPage(1);
    } catch {
      setError("Gagal memuat daftar user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;

    setDeletingUserId(userId);
    setError(null);

    try {
      await axios.delete(`http://localhost:9000/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      // Refresh data user setelah hapus
      await fetchUsers();
    } catch {
      setError("Gagal menghapus user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Memuat daftar user...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (users.length === 0) return <p>Tidak ada user.</p>;

  return (
    <>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-3 py-1">ID</th>
            <th className="border border-gray-300 px-3 py-1">Username</th>
            <th className="border border-gray-300 px-3 py-1">Email</th>
            <th className="border border-gray-300 px-3 py-1">Role</th>
            <th className="border border-gray-300 px-3 py-1">Dibuat pada</th>
            <th className="border border-gray-300 px-3 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-300 px-3 py-1">{user.id}</td>
              <td className="border border-gray-300 px-3 py-1">{user.username}</td>
              <td className="border border-gray-300 px-3 py-1">{user.email}</td>
              <td className="border border-gray-300 px-3 py-1">{user.role || "-"}</td>
              <td className="border border-gray-300 px-3 py-1">
                {new Date(user.created_at).toLocaleString()}
              </td>
              <td className="border border-gray-300 px-3 py-1">
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={deletingUserId === user.id}
                  className={`px-3 py-1 rounded text-white ${
                    deletingUserId === user.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingUserId === user.id ? "Menghapus..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-3 py-1 rounded ${
              currentPage === pageNum ? "bg-teal-600 text-white" : "bg-gray-200"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </>
  );
}


function PreferenceList() {
  const [prefs, setPrefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingPrefId, setDeletingPrefId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:9000/admin/preferences");
      setPrefs(res.data);
      setCurrentPage(1);
    } catch {
      setError("Gagal memuat daftar preferensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleDeletePreference = async (prefId) => {
    if (!window.confirm("Yakin ingin menghapus preferensi ini?")) return;

    setDeletingPrefId(prefId);
    setError(null);

    try {
      await axios.delete(`http://localhost:9000/preferences/${prefId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      await fetchPreferences();
    } catch {
      setError("Gagal menghapus preferensi.");
    } finally {
      setDeletingPrefId(null);
    }
  };

  const totalPages = Math.ceil(prefs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPrefs = prefs.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Memuat daftar preferensi...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (prefs.length === 0) return <p>Tidak ada preferensi.</p>;

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
            <th className="border border-gray-300 px-3 py-1">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentPrefs.map((pref) => (
            <tr key={pref.id} className="text-center">
              <td className="border border-gray-300 px-3 py-1">{pref.id}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.username}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.kab_kota}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jenis_wisata}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jenis_makan}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.budget_hotel}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.prioritas}</td>
              <td className="border border-gray-300 px-3 py-1">{pref.jumlah_paket}</td>
              <td className="border border-gray-300 px-3 py-1">
                {pref.timestamp ? new Date(pref.timestamp).toLocaleString() : "-"}
              </td>
              <td className="border border-gray-300 px-3 py-1">
                <button
                  onClick={() => handleDeletePreference(pref.id)}
                  disabled={deletingPrefId === pref.id}
                  className={`px-3 py-1 rounded text-white ${
                    deletingPrefId === pref.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingPrefId === pref.id ? "Menghapus..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-3 py-1 rounded ${
              currentPage === pageNum ? "bg-teal-600 text-white" : "bg-gray-200"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </>
  );
}

function LogsList() {
  const [logs, setLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState({}); // { recommendation_id: [feedbacks] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingLogId, setDeletingLogId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:9000/admin/logs");
      setLogs(res.data);
      setCurrentPage(1);

      // Ambil semua recommendation_id unik dari log untuk ambil feedback
      const allRecommendationIds = res.data.flatMap((log) => {
        try {
          const parsed = JSON.parse(log.rekomendasi_json);
          if (Array.isArray(parsed)) {
            return parsed.map((r) => r.recommendation_id);
          }
          return [];
        } catch {
          return [];
        }
      });

      const uniqueIds = [...new Set(allRecommendationIds)];

      // Ambil feedback untuk tiap recommendation_id
      uniqueIds.forEach(async (id) => {
        try {
          const { data } = await axios.get(`http://localhost:9000/feedback/${id}`);
          setFeedbacks((prev) => ({ ...prev, [id]: data.feedbacks || data || [] }));
        } catch {
          setFeedbacks((prev) => ({ ...prev, [id]: [] }));
        }
      });
    } catch {
      setError("Gagal memuat log pengguna");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Yakin ingin menghapus log ini?")) return;

    setDeletingLogId(logId);
    setError(null);

    try {
      await axios.delete(`http://localhost:9000/logs/${logId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      await fetchLogs();
    } catch {
      setError("Gagal menghapus log.");
    } finally {
      setDeletingLogId(null);
    }
  };

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) return <p>Memuat data log...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (logs.length === 0) return <p>Belum ada aktivitas pengguna.</p>;

  return (
    <>
      {currentLogs.map((log) => {
        let rekomList = [];
        try {
          const parsed = JSON.parse(log.rekomendasi_json);
          rekomList = Array.isArray(parsed) ? parsed : [];
        } catch {
          rekomList = [];
        }

        return (
          <div key={log.id} className="bg-white rounded-xl shadow p-5 border mb-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{log.username}</p>
                <p className="text-sm text-gray-500">User ID: {log.user_id}</p>
                <p className="text-sm text-gray-500">
                  Waktu: {new Date(log.timestamp).toLocaleString()}
                </p>
                <p className="text-sm mt-1">
                  Preferensi:{" "}
                  <span className="font-medium text-teal-600">{log.preferensi}</span>
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleDeleteLog(log.id)}
                  disabled={deletingLogId === log.id}
                  className={`px-3 py-1 rounded text-white ${
                    deletingLogId === log.id
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingLogId === log.id ? "Menghapus..." : "Delete Log"}
                </button>
              </div>
            </div>

            {rekomList.length === 0 ? (
              <p className="text-gray-600 mt-4">Rekomendasi tidak tersedia.</p>
            ) : (
              rekomList.map((r, idx) => {
                const fb = feedbacks[r.recommendation_id] || [];

                return (
                  <div key={idx} className="border-t mt-4 pt-4">
                    <p className="font-semibold">Akomodasi: {r.Akomodasi || "-"}</p>

                    <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <p className="font-semibold">Tempat Wisata</p>
                        <ul className="list-disc ml-4 max-h-32 overflow-auto">
                          {r["Tempat Wisata"]?.map((w, i) => (
                            <li key={i}>{w.nama_tempat}</li>
                          )) || <li>-</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">Tempat Makan</p>
                        <ul className="list-disc ml-4 max-h-32 overflow-auto">
                          {r["Tempat Makan"]?.map((m, i) => (
                            <li key={i}>{m.nama_tempat}</li>
                          )) || <li>-</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold">Feedback</p>
                        {fb.length > 0 ? (
                          fb.map((f) => (
                            <span
                              key={f.feedback_id}
                              className={`inline-block mt-1 mr-1 px-2 py-1 rounded-full ${
                                f.feedback === "like"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {f.feedback}
                            </span>
                          ))
                        ) : (
                          <span className="inline-block mt-1 px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                            Belum ada feedback
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        );
      })}

      {/* Pagination */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => setCurrentPage(pageNum)}
            className={`px-3 py-1 rounded ${
              currentPage === pageNum ? "bg-teal-600 text-white" : "bg-gray-200"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </>
  );
}


function EvaluationResults() {
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterInput, setFilterInput] = useState("");
  const [filterUserIds, setFilterUserIds] = useState(null);
  const [kValue, setKValue] = useState(5); // default k=5

  const fetchEvaluation = (userIds = null, k = 3) => {
    setLoading(true);
    setError(null);

    const params = { k };
    if (userIds && userIds.length > 0) {
      params.user_ids = userIds.join(",");
    }

    axios
      .get("http://localhost:9000/admin/evaluation", { params })
      .then((res) => {
        setEvaluationResults(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat hasil evaluasi");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvaluation(filterUserIds, kValue);
  }, []);

  const onApplyFilter = () => {
    const ids = filterInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "")
      .map(Number)
      .filter((n) => !isNaN(n));
    const filteredIds = ids.length > 0 ? ids : null;
    setFilterUserIds(filteredIds);
    fetchEvaluation(filteredIds, kValue);
  };

  const onKChange = (e) => {
    const newK = Number(e.target.value);
    setKValue(newK);
    fetchEvaluation(filterUserIds, newK);
  };

  // Render metrics as a table (user metrics or overall metrics)
  const renderMetricsTable = (metrics, showUserId = false, userId = null) => (
    <table className="border border-gray-300 w-full text-sm">
      <thead>
        <tr className="bg-gray-100">
          {showUserId && <th className="border border-gray-300 px-2 py-1">User ID</th>}
          <th className="border border-gray-300 px-2 py-1">Metrik</th>
          <th className="border border-gray-300 px-2 py-1">Nilai</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(metrics).map(([metricKey, metricVal]) => (
          <tr key={metricKey}>
            {showUserId && (
              <td className="border border-gray-300 px-2 py-1 font-medium">{userId}</td>
            )}
            <td className="border border-gray-300 px-2 py-1">{metricKey.replace(/_/g, " ")}</td>
            <td className="border border-gray-300 px-2 py-1">{Number(metricVal).toFixed(4)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Hasil Evaluasi Sistem Rekomendasi</h2>

      <div className="mb-6 flex items-center space-x-3">
        <input
          type="text"
          className="border border-gray-400 rounded px-3 py-1 w-72"
          placeholder="Filter user IDs, pisah dengan koma, misal: 1,2,3"
          value={filterInput}
          onChange={(e) => setFilterInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApplyFilter();
          }}
          disabled={loading}
        />
        <button
          onClick={onApplyFilter}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Terapkan Filter
        </button>
        <button
          onClick={() => {
            setFilterInput("");
            setFilterUserIds(null);
            fetchEvaluation(null, kValue);
          }}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          Reset Filter
        </button>

        <select
          value={kValue}
          onChange={onKChange}
          disabled={loading}
          className="border border-gray-400 rounded px-3 py-1"
        >
          {[3, 5, 10, 15].map((v) => (
            <option key={v} value={v}>
              k = {v}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => fetchEvaluation(filterUserIds, kValue)}
        className="mb-6 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Menjalankan Evaluasi..." : "Jalankan Ulang Evaluasi"}
      </button>

      {loading && <p>Memuat hasil evaluasi...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {evaluationResults && !loading && !error && (
        <div className="space-y-6">
          <h3 className="font-semibold text-lg mb-2">Per User Metrics</h3>
          {Object.entries(evaluationResults.per_user).length === 0 ? (
            <p>Tidak ada data per user.</p>
          ) : (
            Object.entries(evaluationResults.per_user).map(([userId, metrics]) =>
              renderMetricsTable(metrics, true, userId)
            )
          )}

          <h3 className="font-semibold text-lg mt-6 mb-2">Overall Metrics</h3>
          {evaluationResults.overall ? (
            renderMetricsTable(evaluationResults.overall)
          ) : (
            <p>Tidak ada data overall.</p>
          )}
        </div>
      )}

      {!evaluationResults && !loading && !error && <p>Tidak ada data evaluasi.</p>}
    </div>
  );
}


export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");

  // Proteksi akses hanya admin
  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;
    if (!user || user.role !== "admin") {
      alert("Anda bukan admin!");
      navigate("/");
    }
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token"); // jika kamu simpan token
    navigate("/");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Admin Menu</h2>
        <nav className="space-y-4 flex-grow">
          <button
            onClick={() => setActiveTab("users")}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "users" ? "bg-teal-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Daftar User
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "preferences" ? "bg-teal-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Daftar Preferensi
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "logs" ? "bg-teal-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            User Logs & Rekomendasi
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`block w-full text-left px-4 py-2 rounded ${
              activeTab === "evaluation" ? "bg-teal-600 text-white" : "hover:bg-gray-100"
            }`}
          >
            Evaluasi Hasil
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard Admin</h1>
        {activeTab === "users" && <UserList />}
        {activeTab === "preferences" && <PreferenceList />}
        {activeTab === "logs" && <LogsList />}
        {activeTab === "evaluation" && <EvaluationResults />}
      </main>
    </div>
  );
}
