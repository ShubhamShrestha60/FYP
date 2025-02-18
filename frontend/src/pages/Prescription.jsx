import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5001/api';

const Prescription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [prescription, setPrescription] = useState({
    rightEye: {
      sphere: '',
      cylinder: '',
      axis: ''
    },
    leftEye: {
      sphere: '',
      cylinder: '',
      axis: ''
    },
    pdDistance: '',
    prescriptionType: 'Single Vision'
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchPrescriptions();
  }, [user, navigate]);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const handleInputChange = (eye, field, value) => {
    setPrescription(prev => ({
      ...prev,
      [eye]: {
        ...prev[eye],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      // Convert all values to numbers and validate
      const prescriptionData = {
        rightEye: {
          sphere: Number(prescription.rightEye.sphere),
          cylinder: Number(prescription.rightEye.cylinder),
          axis: Number(prescription.rightEye.axis)
        },
        leftEye: {
          sphere: Number(prescription.leftEye.sphere),
          cylinder: Number(prescription.leftEye.cylinder),
          axis: Number(prescription.leftEye.axis)
        },
        pdDistance: Number(prescription.pdDistance),
        prescriptionType: prescription.prescriptionType
      };

      // Validate numbers
      if (isNaN(prescriptionData.rightEye.sphere) || 
          isNaN(prescriptionData.rightEye.cylinder) || 
          isNaN(prescriptionData.rightEye.axis) ||
          isNaN(prescriptionData.leftEye.sphere) ||
          isNaN(prescriptionData.leftEye.cylinder) ||
          isNaN(prescriptionData.leftEye.axis) ||
          isNaN(prescriptionData.pdDistance)) {
        toast.error('Please enter valid numbers for all fields');
        return;
      }

      console.log('Sending data:', prescriptionData);

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        prescriptionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        toast.success('Prescription saved successfully');
        fetchPrescriptions(); // Refresh the list
        // Reset form
        setPrescription({
          rightEye: { sphere: '', cylinder: '', axis: '' },
          leftEye: { sphere: '', cylinder: '', axis: '' },
          pdDistance: '',
          prescriptionType: 'Single Vision'
        });
      }
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save prescription';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Enter Your Prescription</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Right Eye */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Right Eye (OD)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sphere (SPH)</label>
              <input
                type="number"
                step="0.25"
                min="-20"
                max="20"
                placeholder="-20 to +20"
                value={prescription.rightEye.sphere}
                onChange={(e) => handleInputChange('rightEye', 'sphere', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cylinder (CYL)</label>
              <input
                type="number"
                step="0.25"
                min="-6"
                max="6"
                placeholder="-6 to +6"
                value={prescription.rightEye.cylinder}
                onChange={(e) => handleInputChange('rightEye', 'cylinder', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Axis</label>
              <input
                type="number"
                min="0"
                max="180"
                placeholder="0 to 180"
                value={prescription.rightEye.axis}
                onChange={(e) => handleInputChange('rightEye', 'axis', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Left Eye */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Left Eye (OS)</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sphere (SPH)</label>
              <input
                type="number"
                step="0.25"
                value={prescription.leftEye.sphere}
                onChange={(e) => handleInputChange('leftEye', 'sphere', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cylinder (CYL)</label>
              <input
                type="number"
                step="0.25"
                value={prescription.leftEye.cylinder}
                onChange={(e) => handleInputChange('leftEye', 'cylinder', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Axis</label>
              <input
                type="number"
                value={prescription.leftEye.axis}
                onChange={(e) => handleInputChange('leftEye', 'axis', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">PD Distance</label>
              <input
                type="number"
                min="50"
                max="80"
                placeholder="50 to 80"
                value={prescription.pdDistance}
                onChange={(e) => setPrescription({...prescription, pdDistance: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prescription Type</label>
              <select
                value={prescription.prescriptionType}
                onChange={(e) => setPrescription({...prescription, prescriptionType: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              >
                <option value="Single Vision">Single Vision</option>
                <option value="Bifocal">Bifocal</option>
                <option value="Progressive">Progressive</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full ${
            loading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
          } text-white py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2`}
        >
          {loading ? 'Saving...' : 'Save Prescription'}
        </button>
      </form>

      {/* Display Saved Prescriptions */}
      {savedPrescriptions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Saved Prescriptions</h2>
          <div className="space-y-4">
            {savedPrescriptions.map((p, index) => (
              <div key={p._id} className="bg-white p-4 rounded-lg shadow">
                <p className="font-semibold">Prescription {index + 1}</p>
                <p>Date: {new Date(p.createdAt).toLocaleDateString()}</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="font-medium">Right Eye:</p>
                    <p>SPH: {p.rightEye.sphere}</p>
                    <p>CYL: {p.rightEye.cylinder}</p>
                    <p>Axis: {p.rightEye.axis}</p>
                  </div>
                  <div>
                    <p className="font-medium">Left Eye:</p>
                    <p>SPH: {p.leftEye.sphere}</p>
                    <p>CYL: {p.leftEye.cylinder}</p>
                    <p>Axis: {p.leftEye.axis}</p>
                  </div>
                </div>
                <p className="mt-2">PD Distance: {p.pdDistance}</p>
                <p>Type: {p.prescriptionType}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
