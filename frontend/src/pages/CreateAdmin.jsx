import React from 'react';
import axios from 'axios';

const CreateAdmin = () => {
  const createAdminAccount = async () => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/create-admin');
      alert('Admin account created successfully!\nEmail: admin@eyewear.com\nPassword: admin123');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating admin account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={createAdminAccount}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
      >
        Create Admin Account
      </button>
    </div>
  );
};

export default CreateAdmin; 