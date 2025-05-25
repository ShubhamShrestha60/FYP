import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const LensPricingDisplay = ({ 
  prescriptionType, 
  prescription,
  onConfirm
}) => {
  const [selectedCoating, setSelectedCoating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const calculatePrices = async () => {
      if (!prescription) return;
      
      try {
        setLoading(true);
        
        // Get the maximum absolute sphere value from both eyes
        const maxSphere = Math.max(
          Math.abs(prescription.rightEye.sphere),
          Math.abs(prescription.leftEye.sphere)
        );

        // For bifocal/progressive, get the addition value
        const addition = prescription.addition || 0;

        // Fetch lens prices for all coating types
        const response = await axios.post('http://localhost:5001/api/lens/calculate-prices', {
          prescriptionType,
          maxSphere,
          addition,
          coatings: ['Normal', 'Blue Ray Cut', 'Combo']
        });

        setPrices(response.data);
      } catch (error) {
        console.error('Error calculating prices:', error);
        toast.error('Failed to calculate lens prices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    calculatePrices();
  }, [prescription, prescriptionType]);

  const handleCoatingSelect = (coating) => {
    setSelectedCoating(coating);
  };

  const handleConfirm = () => {
    if (!selectedCoating || !prices) return;
    
    const priceKey = selectedCoating.toLowerCase().replace(/ /g, '_');
    const totalPrice = prices[priceKey];
    
    onConfirm({
      coating: selectedCoating,
      type: prescriptionType,
      price: totalPrice || 0
    });
  };

  if (!prescription || !prices) return null;

  const coatingOptions = [
    {
      id: 'normal',
      name: 'Normal',
      description: 'Standard lens coating',
      price: prices.normal
    },
    {
      id: 'blue_ray_cut',
      name: 'Blue Ray Cut',
      description: 'Protection from digital screen light',
      price: prices.blue_ray_cut
    },
    {
      id: 'combo',
      name: 'Combo',
      description: 'Combined protection package',
      price: prices.combo
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Select Lens Coating</h2>
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {coatingOptions.map((coating) => (
            <button
              key={coating.id}
              onClick={() => handleCoatingSelect(coating.name)}
              className={`w-full text-left border rounded-lg p-4 transition-colors
                ${selectedCoating === coating.name 
                  ? 'border-blue-600 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{coating.name}</h3>
                  <p className="text-sm text-gray-600">{coating.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">
                    NPR {coating.price?.toLocaleString()}
                  </p>
                  {prescriptionType === 'Single Vision' && Math.abs(prescription.rightEye.sphere) > 6 && (
                    <p className="text-xs text-gray-500">*High power lens</p>
                  )}
                </div>
              </div>
            </button>
          ))}

          <button
            onClick={handleConfirm}
            disabled={!selectedCoating}
            className={`w-full py-2 px-4 rounded-md transition-colors
              ${selectedCoating
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Confirm Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default LensPricingDisplay;