import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const apiUrl = "http://localhost:9000/token";

    // Form data untuk login (x-www-form-urlencoded)
    const params = new URLSearchParams();
    params.append("username", formData.username);
    params.append("password", formData.password);

    try {
      const response = await axios.post(apiUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.status === 200) {
        const token = response.data.access_token;
        localStorage.setItem("access_token", token);

        // Ambil info user lengkap dari backend dengan token (optional tapi direkomendasikan)
        const userInfoRes = await axios.get("http://localhost:9000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Cari user yang login dari list user
        const userInfo = userInfoRes.data.find(
          (u) => u.username === formData.username
        );

        if (!userInfo) {
          throw new Error("Gagal mengambil data user setelah login");
        }

        // Simpan user lengkap ke localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: userInfo.username,
            role: userInfo.role,
            email: userInfo.email,
            id: userInfo.id,
          })
        );

        setSuccessMessage("Login berhasil");

        if (onLoginSuccess) {
          onLoginSuccess(userInfo);
        }

        // Redirect sesuai role
        if (userInfo.role === "admin") {
          navigate("/admin");
        } else {
          onClose();
        }
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.detail || "Invalid credentials");
      } else {
        setErrorMessage("Terjadi kesalahan, coba lagi nanti.");
      }
      console.error("Login gagal:", error);
    }
  };

  const navigateToRegister = () => {
    onClose();
    navigate("/register");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl w-96 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">Sign In</h2>

        {errorMessage && (
          <div className="text-red-500 text-center mb-4 font-medium">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="text-green-500 text-center mb-4 font-medium">{successMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-2 block w-full rounded-lg border-2 border-gray-300 px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
          >
            Log In
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">
            Belum punya akun?{" "}
            <button
              onClick={navigateToRegister}
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Daftar sekarang
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
