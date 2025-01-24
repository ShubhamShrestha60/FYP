import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import AdminRoutes from './routes/AdminRoutes'; // For admin pages
import Navbar from './components/Navbar'; // For non-admin pages
import Frame from './components/Frame1';
import AllRoutes from './routes/AllRoutes'; // Other routes for non-admin
import ProductNav from './pages/ProductNav';
import Footer from './components/Footer';

const App = () => {
  const location = useLocation();
  
  // Array of paths where Frame should be shown
  const showFramePaths = ['/', '/home'];
  
  // Check if current path should show frame
  const shouldShowFrame = showFramePaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white">
      <div>
        <Navbar />
        <main>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            
            {/* Non-admin Routes */}
            <Route path="/*" element={<AllRoutes />} />
          </Routes>
        </main>
      </div>
      
      {/* Frame section - only shown on specified paths */}
      {shouldShowFrame && (
        <div className="bg-red-700">
          <div className="flex items-center justify-center">
            <Frame />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default App;
