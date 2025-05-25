import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiSearch } from 'react-icons/fi';
import Pagination from '../components/common/Pagination';
import PrescriptionSearch from '../components/prescriptions/PrescriptionSearch';
import PrescriptionFilter from '../components/prescriptions/PrescriptionFilter';
import { filterPrescriptions, getPaginatedItems } from '../utils/prescriptionUtils';

const API_BASE_URL = 'http://localhost:5001/api';

const Prescription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    prescriptionType: '',
    status: '',
    dateRange: ''
  });
  const itemsPerPage = 5;
  const [prescription, setPrescription] = useState({
    patientName: '',
    rightEye: {
      sphere: '',
      cylinder: '',
      axis: '',
      pd: ''
    },
    leftEye: {
      sphere: '',
      cylinder: '',
      axis: '',
      pd: ''
    },
    addition: '',
    prescriptionType: 'Single Vision',
    usage: 'Distance',
    prescriptionDate: new Date().toISOString().split('T')[0]
  });
  const [prescriptionImage, setPrescriptionImage] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    prescriptionId: null
  });

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/prescription' } });
      return;
    }
    fetchPrescriptions();
  }, [user, navigate]);

  useEffect(() => {
    console.log('Saved prescriptions updated:', savedPrescriptions);
  }, [savedPrescriptions]);

  const fetchPrescriptions = async () => {
    try {
      console.log('Fetching prescriptions...');
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Fetched prescriptions:', response.data);
      setSavedPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
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
        patientName: prescription.patientName,
        rightEye: {
          sphere: Number(prescription.rightEye.sphere),
          cylinder: Number(prescription.rightEye.cylinder),
          axis: Number(prescription.rightEye.axis),
          pd: Number(prescription.rightEye.pd)
        },
        leftEye: {
          sphere: Number(prescription.leftEye.sphere),
          cylinder: Number(prescription.leftEye.cylinder),
          axis: Number(prescription.leftEye.axis),
          pd: Number(prescription.leftEye.pd)
        },
        prescriptionType: prescription.prescriptionType,
        usage: prescription.usage,
        prescriptionDate: prescription.prescriptionDate,
        prescriptionImage: prescriptionImage,
        ...(prescription.prescriptionType === 'Bifocal' || prescription.prescriptionType === 'Progressive' 
          ? { addition: Number(prescription.addition) }
          : {})
      };

      console.log('Sending prescription data:', prescriptionData);

      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        prescriptionData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      console.log('Server response:', response.data);

      if (response.data.success) {
        toast.success('Prescription saved successfully');
        fetchPrescriptions();
        setPrescription({
          patientName: '',
          rightEye: { sphere: '', cylinder: '', axis: '', pd: '' },
          leftEye: { sphere: '', cylinder: '', axis: '', pd: '' },
          addition: '',
          prescriptionType: 'Single Vision',
          usage: 'Distance',
          prescriptionDate: new Date().toISOString().split('T')[0]
        });
        setPrescriptionImage(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save prescription';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (prescriptionId) => {
    setDeleteModal({ isOpen: true, prescriptionId });
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete prescriptions');
        return;
      }

      const prescriptionId = deleteModal.prescriptionId;
      console.log('Delete request details:', {
        prescriptionId,
        hasToken: !!token,
        token: token,
        url: `${API_BASE_URL}/prescriptions/${prescriptionId}`
      });

      const prescriptionExists = savedPrescriptions.some(p => p._id === prescriptionId);
      if (!prescriptionExists) {
        toast.error('Prescription not found');
        setDeleteModal({ isOpen: false, prescriptionId: null });
        return;
      }

      const response = await axios.delete(
        `${API_BASE_URL}/prescriptions/${prescriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Delete response:', response.data);

      if (response.data.success) {
        setSavedPrescriptions(prev => 
          prev.filter(p => p._id !== prescriptionId)
        );
        
        toast.success('Prescription deleted successfully');
        setDeleteModal({ isOpen: false, prescriptionId: null });
      } else {
        throw new Error(response.data.message || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Delete operation failed:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        fullError: error,
        requestedId: deleteModal.prescriptionId,
        availableIds: savedPrescriptions.map(p => p._id)
      });

      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to delete prescription'
      );
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ isOpen: false, prescriptionId: null });
  };

  const renderPrescriptionCard = (p) => (
    <div key={p._id} className="bg-white p-6 rounded-lg shadow-md">
      {/* Header with Status and Actions */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            p.status === 'verified' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
          </span>
          <span className="text-gray-500">
            Submitted: {new Date(p.createdAt).toLocaleDateString()}
          </span>
        </div>
        {p.status !== 'verified' && (
          <button
            onClick={() => handleRemove(p._id)}
            className="text-red-600 hover:bg-red-50 px-3 py-1 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Remove
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Eye Details */}
        <div className="space-y-6">
          {/* Right Eye */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Right Eye (OD)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sphere (SPH)</p>
                <p className="font-medium">{p.rightEye.sphere}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cylinder (CYL)</p>
                <p className="font-medium">{p.rightEye.cylinder}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Axis</p>
                <p className="font-medium">{p.rightEye.axis}°</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PD</p>
                <p className="font-medium">{p.rightEye.pd} mm</p>
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Left Eye (OS)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Sphere (SPH)</p>
                <p className="font-medium">{p.leftEye.sphere}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cylinder (CYL)</p>
                <p className="font-medium">{p.leftEye.cylinder}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Axis</p>
                <p className="font-medium">{p.leftEye.axis}°</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PD</p>
                <p className="font-medium">{p.leftEye.pd} mm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Additional Info and Image */}
        <div className="space-y-6">
          {/* Prescription Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Prescription Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Patient Name</p>
                <p className="font-medium">{p.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium">{p.prescriptionType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usage</p>
                <p className="font-medium">{p.usage}</p>
              </div>
              {p.prescriptionType !== 'Single Vision' && (
                <div>
                  <p className="text-sm text-gray-500">Addition Power</p>
                  <p className="font-medium">{p.addition}</p>
                </div>
              )}
            </div>
          </div>

          {/* Prescription Image */}
          {p.prescriptionImage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">Uploaded Prescription</h3>
              <div className="relative">
                <img
                  src={p.prescriptionImage}
                  alt="Prescription"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <a 
                  href={p.prescriptionImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Full Image
                </a>
              </div>
            </div>
          )}

          {/* Verification Notes (if any) */}
          {p.verificationNotes && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2 text-gray-700">Verification Notes</h3>
              <p className="text-gray-600">{p.verificationNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const RemoveConfirmationModal = () => {
    if (!deleteModal.isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Remove Prescription
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove this prescription? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-1.5" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Filter prescriptions based on search term and filters
  const filteredPrescriptions = filterPrescriptions(savedPrescriptions, searchTerm, filters);

  // Get paginated items
  const { currentItems, totalPages } = getPaginatedItems(filteredPrescriptions, currentPage, itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Enter Your Prescription</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Prescription Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Patient Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
            value={prescription.patientName}
            onChange={(e) => setPrescription({...prescription, patientName: e.target.value})}
            placeholder="Enter patient's name"
          />
        </div>

        {/* Right Eye */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Right Eye (OD)</h2>
          <div className="grid grid-cols-4 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">PD</label>
              <input
                type="number"
                step="0.5"
                min="25"
                max="40"
                placeholder="25 to 40"
                value={prescription.rightEye.pd}
                onChange={(e) => handleInputChange('rightEye', 'pd', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Left Eye */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Left Eye (OS)</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sphere (SPH)</label>
              <input
                type="number"
                step="0.25"
                min="-20"
                max="20"
                placeholder="-20 to +20"
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
                min="-6"
                max="6"
                placeholder="-6 to +6"
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
                min="0"
                max="180"
                placeholder="0 to 180"
                value={prescription.leftEye.axis}
                onChange={(e) => handleInputChange('leftEye', 'axis', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PD</label>
              <input
                type="number"
                step="0.5"
                min="25"
                max="40"
                placeholder="25 to 40"
                value={prescription.leftEye.pd}
                onChange={(e) => handleInputChange('leftEye', 'pd', e.target.value)}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Usage</label>
              <select
                value={prescription.usage}
                onChange={(e) => setPrescription({...prescription, usage: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              >
                <option value="Distance">Distance</option>
                <option value="Reading">Reading</option>
                <option value="All-time wear">All-time wear</option>
              </select>
            </div>

            {(prescription.prescriptionType === 'Bifocal' || prescription.prescriptionType === 'Progressive') && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Addition</label>
                <input
                  type="number"
                  step="0.25"
                  min="0.75"
                  max="4.00"
                  placeholder="0.75 to 4.00"
                  value={prescription.addition}
                  onChange={(e) => setPrescription({...prescription, addition: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Prescription Date</label>
              <input
                type="date"
                value={prescription.prescriptionDate}
                onChange={(e) => setPrescription({...prescription, prescriptionDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
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
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Prescriptions</h2>
              <div className="w-64">
                <PrescriptionSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />
              </div>
            </div>
            <PrescriptionFilter
              filters={filters}
              onFilterChange={setFilters}
            />
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Note:</strong> Prescriptions cannot be deleted once they have been verified by our team.
                </p>
              </div>
            </div>
          </div>
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || Object.values(filters).some(Boolean) 
                ? 'No prescriptions found matching your criteria.' 
                : 'No prescriptions found.'}
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                {currentItems.map(renderPrescriptionCard)}
              </div>
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredPrescriptions.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      )}

      <RemoveConfirmationModal />
    </div>
  );
};

export default Prescription;
