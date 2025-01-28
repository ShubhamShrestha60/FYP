import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Frame from '../components/Frame1';

const PublicLayout = () => {
  const location = useLocation();
  const showFramePaths = ['/', '/home'];
  const shouldShowFrame = showFramePaths.includes(location.pathname);

  // If it's an admin route, don't render the public layout at all
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
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

export default PublicLayout; 