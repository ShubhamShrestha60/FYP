import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/forgot-password", { email });
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}
          {success && (
            <p className="text-green-600 text-sm text-center">{success}</p>
          )}

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
            {loading ? "Sending..." : "Reset Password"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-red-600 hover:text-red-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword; 