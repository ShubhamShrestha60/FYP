import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // Import axios
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === "password") {
      const error = validatePassword(value);
      setPasswordError(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        throw new Error("Please fill in all fields");
      }

      // Validate password
      const passwordValidationError = validatePassword(formData.password);
      if (passwordValidationError) {
        throw new Error(passwordValidationError);
      }

      // Make signup request
      const response = await axios.post("http://localhost:5001/api/auth/signup", formData);

      if (response.data.success) {
        setUserId(response.data.userId);
        setVerificationStep(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/verify-email", {
        userId,
        code: verificationCode
      });

      if (response.data.success) {
        // Auto login after successful verification
        await login(formData.email, formData.password);
        navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:5001/api/auth/resend-verification", {
        userId
      });

      if (response.data.success) {
        setError("New verification code sent. Please check your email.");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  if (verificationStep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="max-w-md w-full px-6">
          <h2 className="text-2xl font-semibold text-center mb-8">
            Verify Your Email
          </h2>

          <form onSubmit={handleVerification} className="space-y-4">
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter verification code"
                className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 text-white rounded-sm ${
                loading ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="w-full py-2 text-red-600 hover:text-red-700"
            >
              Resend Code
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full px-6">
        <h2 className="text-2xl font-semibold text-center mb-8">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
            {passwordError && (
              <p className="text-red-600 text-xs mt-1">{passwordError}</p>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Password must contain:
              <ul className="list-disc list-inside">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
                <li>One special character</li>
              </ul>
            </div>
          </div>

          <div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="w-full px-3 py-2 border-b border-gray-300 focus:border-red-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || passwordError}
            className={`w-full py-2 text-white rounded-sm ${
              loading || passwordError ? 'bg-red-400' : 'bg-red-600 hover:bg-red-700'
            } transition-colors`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
