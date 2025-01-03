import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(""); // State for error/success message
  const [messageType, setMessageType] = useState(""); // State for message type (success/error)
  const navigate = useNavigate(); // Initialize useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLogin = async () => {
    try {
      // Send login data to backend API
      const response = await axios.post("http://localhost:5000/api/login", loginData);

      if (response.status === 200) {
        setMessage("Login successful!");
        setMessageType("success"); // Set message type to success

        console.log("User Data:", response.data);

        // Redirect to Home after successful login
        navigate("/");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setMessage("Login failed. Please check your email and password.");
      setMessageType("error"); // Set message type to error
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Log In</h2>

        {/* Display success or error message */}
        {message && (
          <div
            className={`p-2 mb-4 text-center rounded-md ${
              messageType === "success" ? "bg-green-200 text-green-700" : "bg-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-2 right-2 text-gray-500 hover:text-black"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
        >
          Log In
        </button>
        <p className="mt-4 text-sm text-center">
          New to Opera?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
