import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      const returnPath = location.state?.from || '/';
      navigate(returnPath);
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", formData);
      
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        await login(formData.email, formData.password);
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || 
        "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Welcome, {user.name}!
          </h2>
          <p className="text-center">You are logged in.</p>
          <Link to="/" className="text-red-600 hover:text-red-700">
            Go to the landing page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-sm ${
              loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
            } transition-colors`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-red-600 hover:text-red-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
