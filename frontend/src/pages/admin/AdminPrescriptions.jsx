import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminPrescriptions = () => {
  const { adminUser } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    console.log('Admin token exists:', !!token);
    if (!token) {
      toast.error('Please login as admin');
      return;
    }
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      console.log('Fetching prescriptions...');
      const response = await axios.get('http://localhost:5001/api/prescriptions/admin', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      console.log('Fetched prescriptions:', response.data);
      setPrescriptions(response.data);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const verifyPrescriptionMatch = async (prescriptionId, matches, notes) => {
    try {
      await axios.patch(
        `http://localhost:5001/api/prescriptions/${prescriptionId}/verify`,
        {
          status: matches ? 'verified' : 'rejected',
          verificationNotes: notes
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );
      toast.success('Verification status updated');
      fetchPrescriptions();
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  // Modal for viewing images
  const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-4">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          >
            ✕
          </button>
          <img
            src={imageUrl}
            alt="Prescription"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>
    );
  };

  const PrescriptionCard = ({ prescription }) => {
    console.log('Prescription data:', prescription); // Debug log
    
    if (!prescription) return null;
    
    try {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Patient: {prescription.userId?.name || 'Unknown'}
              </h2>
              <p className="text-gray-600">
                Submitted: {new Date(prescription.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              prescription.status === 'verified'
                ? 'bg-green-100 text-green-800'
                : prescription.status === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Manual Entry Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Right Eye (OD)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Sphere</p>
                      <p className="font-medium">{prescription.rightEye.sphere}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cylinder</p>
                      <p className="font-medium">{prescription.rightEye.cylinder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Axis</p>
                      <p className="font-medium">{prescription.rightEye.axis}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Left Eye (OS)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Sphere</p>
                      <p className="font-medium">{prescription.leftEye.sphere}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cylinder</p>
                      <p className="font-medium">{prescription.leftEye.cylinder}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Axis</p>
                      <p className="font-medium">{prescription.leftEye.axis}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">PD Distance</p>
                    <p className="font-medium">{prescription.pdDistance} mm</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prescription Type</p>
                    <p className="font-medium">{prescription.prescriptionType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Uploaded Prescription</h3>
              {prescription.prescriptionImage ? (
                <div className="relative">
                  <img
                    src={prescription.prescriptionImage}
                    alt="Prescription"
                    className="w-full max-h-[400px] object-contain rounded border bg-white"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      e.target.src = 'fallback-image-url';
                    }}
                  />
                  <button
                    onClick={() => setSelectedImage(prescription.prescriptionImage)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Click to view full size
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 bg-gray-100 rounded border border-dashed">
                  <p className="text-gray-500">No prescription image uploaded</p>
                </div>
              )}
            </div>
          </div>

          {prescription.status === 'pending' && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Verify Prescription</h3>
              <textarea
                placeholder="Add verification notes..."
                className="w-full p-3 border rounded-md mb-4 min-h-[100px]"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => verifyPrescriptionMatch(prescription._id, true, verificationNotes)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Verify Match
                </button>
                <button
                  onClick={() => verifyPrescriptionMatch(prescription._id, false, verificationNotes)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Report Mismatch
                </button>
              </div>
            </div>
          )}

          {prescription.verificationNotes && prescription.status !== 'pending' && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Verification Notes:</h4>
              <p className="text-gray-700">{prescription.verificationNotes}</p>
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering prescription:', error);
      return (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">Error displaying this prescription</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Prescription Management</h1>
      
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {prescriptions.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No prescriptions found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {prescriptions.map((prescription) => (
            <PrescriptionCard 
              key={prescription._id} 
              prescription={prescription} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptions; 