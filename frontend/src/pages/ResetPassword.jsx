import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!minLength) return "Password must be at least 8 characters long";
    if (!hasUpperCase) return "Password must contain at least one uppercase letter";
    if (!hasLowerCase) return "Password must contain at least one lowercase letter";
    if (!hasNumbers) return "Password must contain at least one number";
    if (!hasSpecialChar) return "Password must contain at least one special character";
    
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Validate password strength
      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const response = await axios.post("http://localhost:5001/api/auth/reset-password", {
        token,
        password: formData.password
      });

      if (response.data.success) {
        navigate("/login", { 
          state: { message: "Password reset successful. Please login with your new password." }
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6">
          <h2 className="text-2xl font-semibold text-center mb-8 text-red-600">
            Invalid Reset Link
          </h2>
          <p className="text-center text-gray-600">
            The password reset link is invalid or has expired. Please request a new password reset link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="New Password"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm New Password"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div className="text-xs text-gray-500">
            Password must contain:
            <ul className="list-disc list-inside">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-sm ${
              loading ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
            } transition-colors`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword; 