import React, { useState, useEffect } from 'react';

const TryOn = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);

  // Check if backend server is running
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
          setIsServerAvailable(true);
        }
      } catch (err) {
        setError('Backend server is not running. Please start the server.');
        console.error('Server check failed:', err);
      }
    };

    checkServer();
  }, []);

  const startStream = async () => {
    try {
      setError(null);
      setIsStreaming(true);
    } catch (err) {
      setError('Failed to start video stream. Please try again.');
      console.error('Stream start failed:', err);
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
              Connecting to server...
            </div>
          ) : (
            <>
              <button
                onClick={startStream}
                disabled={!isServerAvailable}
                className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 text-lg font-semibold mb-8 disabled:bg-gray-400"
              >
                Start Virtual Try-On
              </button>

              {isStreaming && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <img 
                    src="http://localhost:5000/video_feed"
                    alt="Virtual Try-On Stream"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      setError('Failed to load video stream');
                      setIsStreaming(false);
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setIsStreaming(false)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm"
                    >
                      Stop Stream
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryOn;
