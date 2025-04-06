import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axios';

const LensManagement = () => {
  const [lensTypes, setLensTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [newLensType, setNewLensType] = useState({
    name: '',
    minPower: -8.00,
    maxPower: 8.00,
    basePrice: 0,
    description: ''
  });

  useEffect(() => {
    fetchLensTypes();
  }, []);

  const fetchLensTypes = async () => {
    try {
      const response = await axiosInstance.get('/admin/lens-types');
      setLensTypes(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch lens types');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/lens-types', newLensType);
      fetchLensTypes();
      setNewLensType({
        name: '',
        minPower: -8.00,
        maxPower: 8.00,
        basePrice: 0,
        description: ''
      });
    } catch (err) {
      setError('Failed to create lens type');
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      await axiosInstance.put(`/admin/lens-types/${id}`, updatedData);
      fetchLensTypes();
    } catch (err) {
      setError('Failed to update lens type');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/admin/lens-types/${id}`);
      fetchLensTypes();
    } catch (err) {
      setError('Failed to delete lens type');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
  </div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lens Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Lens Type</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={newLensType.name}
              onChange={(e) => setNewLensType({...newLensType, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Min Power</label>
              <input
                type="number"
                step="0.25"
                value={newLensType.minPower}
                onChange={(e) => setNewLensType({...newLensType, minPower: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Power</label>
              <input
                type="number"
                step="0.25"
                value={newLensType.maxPower}
                onChange={(e) => setNewLensType({...newLensType, maxPower: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Base Price</label>
            <input
              type="number"
              step="0.01"
              value={newLensType.basePrice}
              onChange={(e) => setNewLensType({...newLensType, basePrice: parseFloat(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={newLensType.description}
              onChange={(e) => setNewLensType({...newLensType, description: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              rows="3"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Add Lens Type
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Power Range</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lensTypes.map((lens) => (
              <tr key={lens._id}>
                <td className="px-6 py-4 whitespace-nowrap">{lens.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{lens.minPower} to {lens.maxPower}</td>
                <td className="px-6 py-4 whitespace-nowrap">${lens.basePrice.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleUpdate(lens._id, { ...lens, basePrice: lens.basePrice + 5 })}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(lens._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LensManagement;