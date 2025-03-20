import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const TRYON_SERVICE_URL = 'http://localhost:5000';

const TryOn = () => {
  const [error, setError] = useState(null);
  const [isServerAvailable, setIsServerAvailable] = useState(false);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [currentCollection, setCurrentCollection] = useState('Sunglasses');
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [collections, setCollections] = useState({
    Sunglasses: [],
    Eyeglasses: [],
    Sports: []
  });

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get(`${TRYON_SERVICE_URL}/health`);
        if (response.data.status === 'healthy') {
          setIsServerAvailable(true);
          const collectionsData = await axios.get(`${TRYON_SERVICE_URL}/collections`);
          setCollections(collectionsData.data);
        }
      } catch (err) {
        setError('Virtual Try-On service is not available.');
        console.error('Server check failed:', err);
      }
    };
    checkServer();
  }, []);

  const startTryOn = async () => {
    try {
      await axios.post(`${TRYON_SERVICE_URL}/start-stream`);
      setIsStreamActive(true);
    } catch (err) {
      setError('Failed to start virtual try-on.');
      console.error('Launch failed:', err);
    }
  };

  const stopTryOn = async () => {
    try {
      await axios.post(`${TRYON_SERVICE_URL}/stop-stream`);
      setIsStreamActive(false);
    } catch (err) {
      console.error('Stop failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1B]">
      <div className="bg-[#1B1B1B] h-24 flex items-center px-14">
        <div className="text-[#C4B27D] text-3xl font-bold">OPERA EYEWEAR</div>
        <div className="text-white ml-6 text-sm">VIRTUAL TRY-ON</div>
      </div>

      <div className="container mx-auto px-14 py-8 flex gap-8">
        <div className="flex-1 bg-[#F5F5F5] rounded-lg overflow-hidden">
          {isStreamActive ? (
            <div className="relative aspect-video">
              <img 
                src={`${TRYON_SERVICE_URL}/video_feed`}
                alt="Virtual Try-On Feed"
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button
                  onClick={() => setCurrentFrameIndex(prev => 
                    prev > 0 ? prev - 1 : collections[currentCollection].length - 1
                  )}
                  className="bg-white p-2 rounded-full shadow-lg"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentFrameIndex(prev => 
                    (prev + 1) % collections[currentCollection].length
                  )}
                  className="bg-white p-2 rounded-full shadow-lg"
                >
                  <FiChevronRight size={24} />
                </button>
                <button
                  onClick={stopTryOn}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Stop Try-On
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <button
                onClick={startTryOn}
                className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 text-lg font-semibold"
                disabled={!isServerAvailable}
              >
                Start Virtual Try-On
              </button>
            </div>
          )}
        </div>

        <div className="w-80 space-y-6">
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Collections</h2>
            <div className="space-y-2">
              {Object.keys(collections).map((collection) => (
                <button
                  key={collection}
                  onClick={() => setCurrentCollection(collection)}
                  className={`w-full py-3 px-4 rounded text-left transition-colors ${
                    currentCollection === collection
                      ? 'bg-[#C4B27D] text-[#1B1B1B]'
                      : 'bg-white text-[#1B1B1B] hover:bg-gray-100'
                  }`}
                >
                  {collection}
                </button>
              ))}
            </div>
          </div>

          {collections[currentCollection]?.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-bold mb-2">Current Frame</h3>
              <p>{collections[currentCollection][currentFrameIndex]?.name}</p>
              <p className="text-sm text-gray-600">
                {currentFrameIndex + 1} of {collections[currentCollection].length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TryOn;
