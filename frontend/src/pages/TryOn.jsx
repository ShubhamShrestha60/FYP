import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TRYON_SERVICE_URL = 'http://localhost:5000';

const TryOn = () => {
  const [error, setError] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  // Check if Python server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get(`${TRYON_SERVICE_URL}/health`);
        if (response.data.status === 'healthy') {
          setIsServerAvailable(true);
        }
      } catch (err) {
        setError('Virtual Try-On service is not available. Please try again later.');
        console.error('Server check failed:', err);
      }
    };

    checkServer();
  }, []);

  const launchTryOn = async () => {
    try {
      setError(null);
      await axios.post(`${TRYON_SERVICE_URL}/start`);
    } catch (err) {
      setError('Failed to start virtual try-on. Please try again.');
      console.error('Launch failed:', err);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Virtual Try-On</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          {!isServerAvailable ? (
            <div className="text-yellow-600 bg-yellow-100 p-4 rounded-lg">
              Connecting to Virtual Try-On service...
            </div>
          ) : (
            <button
              onClick={launchTryOn}
              className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 text-lg font-semibold mb-8"
            >
              Launch Virtual Try-On
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryOn;
