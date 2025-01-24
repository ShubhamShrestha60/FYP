import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout functionality here (e.g., clear session, tokens, etc.)
    // Example: localStorage.removeItem('authToken'); or any state you use for authentication.
    
    navigate('/admin/login'); // Redirect to login page after logout
  };

  return (
    <div className="navbar-container">
      <div className="logo">
        <h2>Admin Panel</h2>
      </div>
      <div className="nav-links">
        <Link to="dashboard">Dashboard</Link> {/* Use Link instead of <a> */}
        <Link to="products">Products</Link>     {/* Use Link instead of <a> */}
        <Link to="settings">Admin Settings</Link> {/* Use Link instead of <a> */}
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Remove the jsx attribute and use plain CSS */}
      <style>
        {`
          .navbar-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background-color: #111;
            color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .logo h2 {
            margin: 0;
            font-size: 24px;
          }

          .nav-links {
            display: flex;
            align-items: center;
          }

          .nav-links a {
            margin-right: 20px;
            text-decoration: none;
            color: white;
            font-size: 18px;
          }

          .nav-links a:hover {
            color: #11daac;
          }

          .logout-button {
            background-color: #e53e3e;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
          }

          .logout-button:hover {
            background-color: #c53030;
          }
        `}
      </style>
    </div>
  );
}
