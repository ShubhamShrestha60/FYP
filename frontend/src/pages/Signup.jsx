import React, { useState } from "react";
import axios from "axios"; // Import axios

const Signup = () => {
  const [signupData, setSignupData] = useState({
    name: "", // Full name from user input
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const handleSignup = async () => {
    // Split the 'name' into 'firstName' and 'lastName'
    const [firstName, lastName] = signupData.name.split(" ");

    const dataToSend = {
      firstName, // Pass first name to backend
      lastName,  // Pass last name to backend
      email: signupData.email,
      password: signupData.password,
    };

    console.log("Signup Data:", dataToSend);

    try {
      // Send data to backend API (replace 'your-api-url' with your actual backend URL)
      const response = await axios.post("http://localhost:5000/api/signup", dataToSend);
      
      // Assuming the backend sends a success message
      if (response.status === 201) {
        alert("Signup successful!");
      }
    } catch (error) {
      // Handle any errors that occur during the request
      console.error("Error during signup:", error);
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-4 text-center">Sign Up</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={signupData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={signupData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={signupData.password}
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
          onClick={handleSignup}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
        >
          Sign Up
        </button>
        <p className="mt-4 text-sm text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
