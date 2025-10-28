import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const apiUrl = "http://localhost:9000/register";

    try {
      const response = await axios.post(apiUrl, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.msg);

        setTimeout(() => {
          navigate("/?autologin=true");
        }, 1500);
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message || "Registration failed");
      } else {
        setErrorMessage("An error occurred. Please try again later.");
      }
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 lg:px-8">
      {/* Hero Section */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-100 text-gray-800 flex items-center justify-center rounded-l-lg p-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">Welcome!</h1>
          <p className="mt-4 text-lg">Create an account to get started with us.</p>
        </div>
      </div>

      {/* Registration Form Section */}
      <div className="bg-white p-8 rounded-xl w-full lg:w-1/2 shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900 text-center">Sign Up</h2>

        {/* Display Error or Success Message */}
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-base text-gray-900 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-base text-gray-900 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
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
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-base text-gray-900 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
