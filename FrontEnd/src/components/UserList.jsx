import React, { useEffect, useState } from "react";
import axios from "axios";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:9000/admin/users")
      .then(res => {
        setUsers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data user");
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Memuat data user...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white shadow rounded p-5">
      <h2 className="text-xl font-semibold mb-4">Daftar User</h2>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-3 py-2">ID</th>
            <th className="border border-gray-300 px-3 py-2">Username</th>
            <th className="border border-gray-300 px-3 py-2">Email</th>
            <th className="border border-gray-300 px-3 py-2">Role</th>
            <th className="border border-gray-300 px-3 py-2">Dibuat pada</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-3 py-2 text-center">{user.id}</td>
              <td className="border border-gray-300 px-3 py-2">{user.username}</td>
              <td className="border border-gray-300 px-3 py-2">{user.email}</td>
              <td className="border border-gray-300 px-3 py-2">{user.role}</td>
              <td className="border border-gray-300 px-3 py-2">{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
