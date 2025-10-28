import { useState } from 'react';
import axios from 'axios'; // Import axios
import { useNavigate } from 'react-router-dom'; // Import useNavigate untuk navigasi

export default function AuthModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRegister, setIsRegister] = useState(false); // State untuk toggle antara login dan register
  const navigate = useNavigate(); // Hook untuk navigasi ke halaman lain

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Tentukan endpoint API untuk login dan register
    const apiUrl = isRegister
      ? 'http://localhost:9000/register' // Endpoint untuk registrasi
      : 'http://localhost:9000/login'; // Endpoint untuk login

    try {
      const response = await axios.post(apiUrl, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.msg); // Handle successful response
        console.log(response.data);

        // Setelah registrasi berhasil, navigasi ke halaman login
        if (isRegister) {
          setTimeout(() => {
            navigate('/login');
          }, 1500); // Optional delay before navigating
        }
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || 'An error occurred.');
      } else {
        setErrorMessage('An error occurred. Please try again later.');
      }
      console.error('Request failed:', error);
    }
  };

  // Toggle between login and register
  const toggleAuthMode = () => {
    setIsRegister(!isRegister);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-xl w-96 shadow-lg relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            {isRegister ? 'Sign Up' : 'Sign In'}
          </h2>

          {/* Display error or success message */}
          {errorMessage && (
            <div className="text-red-500 text-center mb-4 font-medium">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="text-green-500 text-center mb-4 font-medium">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-base text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-base text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-base text-gray-900 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
              >
                {isRegister ? 'Register' : 'Log In'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <span className="text-sm text-gray-600">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={toggleAuthMode}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                {isRegister ? 'Login now' : 'Register now'}
              </button>
            </span>
          </div>
        </div>
      </div>
    )
  );
}
