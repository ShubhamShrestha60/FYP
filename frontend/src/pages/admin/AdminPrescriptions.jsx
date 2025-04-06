import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_BASE_URL = 'http://localhost:5001/api';

const AdminPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/prescriptions/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data);
    } catch (error) {
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async (id, status) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        toast.error('Admin authentication required');
        return;
      }
      await axios.patch(
        `${API_BASE_URL}/prescriptions/${id}/verify`,
        { status, verificationNotes },
        { headers: { Authorization: `Bearer ${adminToken}` }}
      );
      fetchPrescriptions();
      setSelectedPrescription(null);
      setVerificationNotes('');
      toast.success(`Prescription ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update prescription status');
    }
  };

  const filteredPrescriptions = prescriptions
    .filter(p => filter === 'all' || p.status === filter)
    .filter(p => 
      searchTerm === '' || 
      p.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Table view for prescriptions list
  const PrescriptionsList = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredPrescriptions.map(p => (
            <tr key={p._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{p.userId?.name || 'N/A'}</div>
                <div className="text-sm text-gray-500">{p.userId?.email}</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(p.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {p.prescriptionType}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  p.status === 'verified' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => setSelectedPrescription(p)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Detailed view modal
  const PrescriptionModal = () => {
    if (!selectedPrescription) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Prescription Details</h2>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Eye Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Right Eye (OD)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-gray-500">Sphere:</span> {selectedPrescription.rightEye.sphere}</div>
                    <div><span className="text-gray-500">Cylinder:</span> {selectedPrescription.rightEye.cylinder}</div>
                    <div><span className="text-gray-500">Axis:</span> {selectedPrescription.rightEye.axis}°</div>
                    <div><span className="text-gray-500">PD:</span> {selectedPrescription.rightEye.pd} mm</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Left Eye (OS)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-gray-500">Sphere:</span> {selectedPrescription.leftEye.sphere}</div>
                    <div><span className="text-gray-500">Cylinder:</span> {selectedPrescription.leftEye.cylinder}</div>
                    <div><span className="text-gray-500">Axis:</span> {selectedPrescription.leftEye.axis}°</div>
                    <div><span className="text-gray-500">PD:</span> {selectedPrescription.leftEye.pd} mm</div>
                  </div>
                </div>
              </div>

              {/* Additional Info and Actions */}
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium mb-2">Prescription Info</h3>
                  <div className="space-y-2">
                    <div><span className="text-gray-500">Type:</span> {selectedPrescription.prescriptionType}</div>
                    <div><span className="text-gray-500">Usage:</span> {selectedPrescription.usage}</div>
                    {selectedPrescription.addition && (
                      <div><span className="text-gray-500">Addition:</span> {selectedPrescription.addition}</div>
                    )}
                  </div>
                </div>

                {selectedPrescription.prescriptionImage && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium mb-2">Prescription Image</h3>
                    <img
                      src={selectedPrescription.prescriptionImage}
                      alt="Prescription"
                      className="w-full h-48 object-contain rounded"
                    />
                    <a
                      href={selectedPrescription.prescriptionImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      View Full Image
                    </a>
                  </div>
                )}

                {selectedPrescription.status === 'pending' && (
                  <div className="space-y-3">
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes..."
                      className="w-full p-2 border rounded"
                      rows="3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerificationUpdate(selectedPrescription._id, 'verified')}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerificationUpdate(selectedPrescription._id, 'rejected')}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {selectedPrescription.verificationNotes && (
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="font-medium mb-2">Verification Notes</h3>
                    <p className="text-gray-700">{selectedPrescription.verificationNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Prescription Management</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <input
              type="text"
              placeholder="Search by patient name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 flex-1 min-w-[200px]"
            />
          </div>
          <div className="text-sm text-gray-500">
            Showing {filteredPrescriptions.length} prescriptions
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="text-center py-8">Loading prescriptions...</div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No prescriptions found
        </div>
      ) : (
        <PrescriptionsList />
      )}

      {/* Detail Modal */}
      <PrescriptionModal />
    </div>
  );
};

export default AdminPrescriptions;