import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PrescriptionComparison from './PrescriptionComparison';

const LensSelection = () => {
  const { prescriptionId } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [selectedLensType, setSelectedLensType] = useState('');
  const [selectedCoating, setSelectedCoating] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const lensTypes = ['Single Vision', 'Bifocal', 'Progressive'];
  const coatingTypes = ['Normal', 'Blue Ray Cut', 'Combo'];

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        const response = await axios.get(`/api/prescriptions/${prescriptionId}`);
        if (response.data.prescription.status !== 'verified') {
          setError('This prescription has not been verified yet');
          return;
        }
        setPrescription(response.data.prescription);
      } catch (err) {
        setError('Failed to fetch prescription details');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [prescriptionId]);

  const handleCompatibilityCheck = (result) => {
    setComparisonResult(result);
  };

  const handleProceed = () => {
    if (comparisonResult?.isValid) {
      navigate('/checkout', {
        state: {
          prescriptionId,
          lensType: selectedLensType,
          coating: selectedCoating,
          price: comparisonResult.totalPrice
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Select Your Lens</h1>
        
        {/* Prescription Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Prescription Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Right Eye</h3>
              <p>Sphere: {prescription?.rightEye.sphere}</p>
              <p>Cylinder: {prescription?.rightEye.cylinder}</p>
            </div>
            <div>
              <h3 className="font-medium">Left Eye</h3>
              <p>Sphere: {prescription?.leftEye.sphere}</p>
              <p>Cylinder: {prescription?.leftEye.cylinder}</p>
            </div>
          </div>
        </div>

        {/* Lens Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Choose Your Lens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lens Type
              </label>
              <select
                value={selectedLensType}
                onChange={(e) => setSelectedLensType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select lens type</option>
                {lensTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coating
              </label>
              <select
                value={selectedCoating}
                onChange={(e) => setSelectedCoating(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select coating</option>
                {coatingTypes.map(coating => (
                  <option key={coating} value={coating}>{coating}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Results */}
        {selectedLensType && selectedCoating && (
          <PrescriptionComparison
            prescriptionId={prescriptionId}
            selectedLensType={selectedLensType}
            selectedCoating={selectedCoating}
            onCompatibilityCheck={handleCompatibilityCheck}
          />
        )}

        {/* Proceed Button */}
        {comparisonResult?.isValid && (
          <div className="mt-6">
            <button
              onClick={handleProceed}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LensSelection; 