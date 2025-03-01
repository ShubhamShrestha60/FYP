import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiUpload } from 'react-icons/fi';

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
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/prescription' } });
      return;
    }
    fetchPrescriptions();
  }, [user, navigate]);

  const fetchPrescriptions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prescriptions`);
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('prescriptionImage', file);

    try {
      console.log('Uploading prescription image...');
      const response = await axios.post(
        `${API_BASE_URL}/prescriptions/upload`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log('Upload response:', response.data);
      setPrescriptionImage(response.data.imageUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Error uploading image');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
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
        prescriptionType: prescription.prescriptionType,
        prescriptionImage: prescriptionImage
      };

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

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        prescriptionData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success('Prescription saved successfully');
        fetchPrescriptions();
        setPrescription({
          rightEye: { sphere: '', cylinder: '', axis: '' },
          leftEye: { sphere: '', cylinder: '', axis: '' },
          pdDistance: '',
          prescriptionType: 'Single Vision'
        });
        setPrescriptionImage(null);
      }
    } catch (error) {
      console.error('Full error:', error);
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

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Prescription Image</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="prescription-image"
            />
            <label
              htmlFor="prescription-image"
              className="flex items-center px-4 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
            >
              <FiUpload className="mr-2" />
              Upload Prescription Image
            </label>
            {uploadLoading && <span>Uploading...</span>}
            {prescriptionImage && <span className="text-green-600">Image uploaded successfully</span>}
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
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Prescription {index + 1}</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    p.status === 'verified' ? 'bg-green-100 text-green-800' :
                    p.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
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
                {p.prescriptionImage && (
                  <div className="mt-2">
                    <a 
                      href={p.prescriptionImage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Prescription Image
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
