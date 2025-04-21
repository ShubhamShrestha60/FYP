import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const VerifiedPrescriptions = ({ prescriptionType, onSelectPrescription, onBack }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVerifiedPrescriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          console.error('Authentication required:', { hasToken: !!token, hasUser: !!user });
          return;
        }

        const response = await axios.get(
          'http://localhost:5001/api/prescriptions',
          {
            params: {
              status: 'verified',
              prescriptionType: prescriptionType,
              userId: user._id
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const verifiedPrescriptions = response.data.filter(p => 
          p.status === 'verified' && p.prescriptionType === prescriptionType
        );

        setPrescriptions(verifiedPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to fetch prescriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedPrescriptions();
  }, [prescriptionType, user]);

  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
    onSelectPrescription(prescription);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-600 mb-4">No verified prescriptions found for {prescriptionType}.</p>
        <div className="space-x-4">
          <button
            onClick={onBack}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={() => window.location.href = '/prescription'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Upload New Prescription
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Select a Verified Prescription</h3>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div
            key={prescription._id}
            onClick={() => handlePrescriptionSelect(prescription)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPrescription?._id === prescription._id 
                ? 'border-blue-500 bg-blue-50' 
                : 'hover:border-blue-500'
            }`}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 mb-2">
                <p className="font-medium">Patient Name: {prescription.patientName}</p>
              </div>
              <div>
                <p className="font-medium mb-2">Right Eye (OD)</p>
                <div className="text-sm space-y-1">
                  <p>Sphere: {prescription.rightEye.sphere}</p>
                  <p>Cylinder: {prescription.rightEye.cylinder}</p>
                  <p>Axis: {prescription.rightEye.axis}°</p>
                  <p>PD: {prescription.rightEye.pd}</p>
                </div>
              </div>
              <div>
                <p className="font-medium mb-2">Left Eye (OS)</p>
                <div className="text-sm space-y-1">
                  <p>Sphere: {prescription.leftEye.sphere}</p>
                  <p>Cylinder: {prescription.leftEye.cylinder}</p>
                  <p>Axis: {prescription.leftEye.axis}°</p>
                  <p>PD: {prescription.leftEye.pd}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Prescription Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}</p>
              {prescription.addition && <p>Addition: {prescription.addition}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerifiedPrescriptions;