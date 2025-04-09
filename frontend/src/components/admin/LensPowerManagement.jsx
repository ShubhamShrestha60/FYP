import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LensPowerManagement = () => {
  const [lenses, setLenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    coating: '',
    singleVisionBasePrice: '',
    singleVisionIncreasedPrice: '',
    bifocalBasePrice: '',
    bifocalIncreasedPrice: '',
    progressiveBasePrice: '',
    progressiveIncreasedPrice: ''
  });

  useEffect(() => {
    fetchLenses();
  }, []);

  const fetchLenses = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/lens');
      console.log('API Response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setLenses(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setLenses(response.data.data);
      } else {
        console.error('Invalid data format received:', response.data);
        setLenses([]);
        toast.error('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching lenses:', error);
      setLenses([]);
      toast.error('Failed to fetch lens configurations');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.type || !formData.coating) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Get the appropriate price fields based on lens type
      let submissionData = {
        type: formData.type,
        coating: formData.coating
      };

      switch (formData.type) {
        case 'Single Vision':
          if (!formData.singleVisionBasePrice || !formData.singleVisionIncreasedPrice) {
            toast.error('Both base and increased prices are required for Single Vision lenses');
            return;
          }
          submissionData.singleVisionBasePrice = Math.round(parseFloat(formData.singleVisionBasePrice) * 100) / 100;
          submissionData.singleVisionIncreasedPrice = Math.round(parseFloat(formData.singleVisionIncreasedPrice) * 100) / 100;
          console.log('Single Vision prices before submission:', {
            base: submissionData.singleVisionBasePrice,
            increased: submissionData.singleVisionIncreasedPrice
          });
          break;
        case 'Bifocal':
          if (!formData.bifocalBasePrice || !formData.bifocalIncreasedPrice) {
            toast.error('Both base and increased prices are required for Bifocal lenses');
            return;
          }
          submissionData.bifocalBasePrice = Math.round(parseFloat(formData.bifocalBasePrice) * 100) / 100;
          submissionData.bifocalIncreasedPrice = Math.round(parseFloat(formData.bifocalIncreasedPrice) * 100) / 100;
          console.log('Bifocal prices before submission:', {
            base: submissionData.bifocalBasePrice,
            increased: submissionData.bifocalIncreasedPrice
          });
          break;
        case 'Progressive':
          if (!formData.progressiveBasePrice || !formData.progressiveIncreasedPrice) {
            toast.error('Both base and increased prices are required for Progressive lenses');
            return;
          }
          submissionData.progressiveBasePrice = Math.round(parseFloat(formData.progressiveBasePrice) * 100) / 100;
          submissionData.progressiveIncreasedPrice = Math.round(parseFloat(formData.progressiveIncreasedPrice) * 100) / 100;
          console.log('Progressive prices before submission:', {
            base: submissionData.progressiveBasePrice,
            increased: submissionData.progressiveIncreasedPrice
          });
          break;
      }

      // Log the form data before submission
      console.log('Submitting form data:', submissionData);
      
      if (editingId) {
        const response = await axios.put(`http://localhost:5001/api/lens/${editingId}`, submissionData);
        console.log('Update response:', response.data);
        toast.success('Lens configuration updated successfully');
      } else {
        const response = await axios.post('http://localhost:5001/api/lens', submissionData);
        console.log('Create response:', response.data);
        toast.success('Lens configuration created successfully');
      }
      
      setFormData({
        type: '',
        coating: '',
        singleVisionBasePrice: '',
        singleVisionIncreasedPrice: '',
        bifocalBasePrice: '',
        bifocalIncreasedPrice: '',
        progressiveBasePrice: '',
        progressiveIncreasedPrice: ''
      });
      setEditingId(null);
      fetchLenses();
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lens) => {
    setEditingId(lens._id);
    setFormData({
      type: lens.type,
      coating: lens.coating,
      singleVisionBasePrice: lens.singleVisionBasePrice || '',
      singleVisionIncreasedPrice: lens.singleVisionIncreasedPrice || '',
      bifocalBasePrice: lens.bifocalBasePrice || '',
      bifocalIncreasedPrice: lens.bifocalIncreasedPrice || '',
      progressiveBasePrice: lens.progressiveBasePrice || '',
      progressiveIncreasedPrice: lens.progressiveIncreasedPrice || ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await axios.delete(`http://localhost:5001/api/lens/${id}`);
        toast.success('Lens configuration deleted successfully');
        fetchLenses();
      } catch (error) {
        console.error('Error deleting lens:', error);
        toast.error('Failed to delete lens configuration');
      }
    }
  };

  const getPriceForLens = (lens) => {
    console.log('Getting base price for lens:', lens);
    switch (lens.type) {
      case 'Single Vision':
        console.log('Single Vision base price:', lens.singleVisionBasePrice);
        return lens.singleVisionBasePrice;
      case 'Bifocal':
        console.log('Bifocal base price:', lens.bifocalBasePrice);
        return lens.bifocalBasePrice;
      case 'Progressive':
        console.log('Progressive base price:', lens.progressiveBasePrice);
        return lens.progressiveBasePrice;
      default:
        return 0;
    }
  };

  const getIncreasedPriceForLens = (lens) => {
    console.log('Getting increased price for lens:', lens);
    switch (lens.type) {
      case 'Single Vision':
        console.log('Single Vision increased price:', lens.singleVisionIncreasedPrice);
        return lens.singleVisionIncreasedPrice;
      case 'Bifocal':
        console.log('Bifocal increased price:', lens.bifocalIncreasedPrice);
        return lens.bifocalIncreasedPrice;
      case 'Progressive':
        console.log('Progressive increased price:', lens.progressiveIncreasedPrice);
        return lens.progressiveIncreasedPrice;
      default:
        return 0;
    }
  };

  const getPrescriptionRange = (lens) => {
    switch (lens.type) {
      case 'Single Vision':
        return (
          <div className="text-sm">
            <div>Sphere: 0 to -8.00</div>
            <div>Cylinder: 0 to -2.00</div>
            <div>Base price for 0 to -6.00</div>
            <div>Increased price for -6.00 to -8.00</div>
          </div>
        );
      case 'Bifocal':
        return (
          <div className="text-sm">
            <div>Sphere: 0 to -6.00</div>
            <div>Cylinder: 0 to -2.00</div>
            <div>Near: 0 to +6.00</div>
            <div>Base price for near 0 to +6.00</div>
            <div>Increased price for near {'>'} +6.00</div>
          </div>
        );
      case 'Progressive':
        return (
          <div className="text-sm">
            <div>Sphere: 0 to -6.00</div>
            <div>Cylinder: 0 to -2.00</div>
            <div>Near: 0 to +6.00</div>
            <div>Base price for near 0 to +6.00</div>
            <div>Increased price for near {'>'} +6.00</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Lens Power Management</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block mb-2">Lens Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Type</option>
            <option value="Single Vision">Single Vision</option>
            <option value="Bifocal">Bifocal</option>
            <option value="Progressive">Progressive</option>
          </select>
        </div>

        <div>
          <label className="block mb-2">Coating</label>
          <select
            name="coating"
            value={formData.coating}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Coating</option>
            <option value="Normal">Normal</option>
            <option value="Blue Ray Cut">Blue Ray Cut</option>
            <option value="Combo">Combo</option>
          </select>
        </div>

        {formData.type === 'Single Vision' && (
          <>
            <div>
              <label className="block mb-2">Single Vision Base Price (NPR)</label>
              <input
                type="number"
                name="singleVisionBasePrice"
                value={formData.singleVisionBasePrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2">Single Vision Increased Price (NPR)</label>
              <input
                type="number"
                name="singleVisionIncreasedPrice"
                value={formData.singleVisionIncreasedPrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold">Prescription Range</h3>
              <p className="text-sm text-gray-600">
                This price applies to Single Vision lenses with:
                <br />
                • Sphere power from 0 to -8.00 (in 0.25 increments)
                <br />
                • Cylinder power from 0 to -2.00 (in 0.25 increments)
                <br />
                • Base price applies when sphere is 0 to -6.00
                <br />
                • Increased price applies when sphere is -6.00 to -8.00
              </p>
            </div>
          </>
        )}

        {formData.type === 'Bifocal' && (
          <>
            <div>
              <label className="block mb-2">Bifocal Base Price (NPR)</label>
              <input
                type="number"
                name="bifocalBasePrice"
                value={formData.bifocalBasePrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2">Bifocal Increased Price (NPR)</label>
              <input
                type="number"
                name="bifocalIncreasedPrice"
                value={formData.bifocalIncreasedPrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold">Prescription Range</h3>
              <p className="text-sm text-gray-600">
                This price applies to Bifocal lenses with:
                <br />
                • Sphere power from 0 to -6.00 (in 0.25 increments)
                <br />
                • Cylinder power from 0 to -2.00 (in 0.25 increments)
                <br />
                • Near distance from 0 to +6.00 (in 0.25 increments)
                <br />
                • Base price applies when near distance is 0 to +6.00
                <br />
                • Increased price applies when near distance is greater than +6.00
              </p>
            </div>
          </>
        )}

        {formData.type === 'Progressive' && (
          <>
            <div>
              <label className="block mb-2">Progressive Base Price (NPR)</label>
              <input
                type="number"
                name="progressiveBasePrice"
                value={formData.progressiveBasePrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block mb-2">Progressive Increased Price (NPR)</label>
              <input
                type="number"
                name="progressiveIncreasedPrice"
                value={formData.progressiveIncreasedPrice}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-4 p-4 border rounded bg-gray-50">
              <h3 className="font-semibold">Prescription Range</h3>
              <p className="text-sm text-gray-600">
                This price applies to Progressive lenses with:
                <br />
                • Sphere power from 0 to -6.00 (in 0.25 increments)
                <br />
                • Cylinder power from 0 to -2.00 (in 0.25 increments)
                <br />
                • Near distance from 0 to +6.00 (in 0.25 increments)
                <br />
                • Base price applies when near distance is 0 to +6.00
                <br />
                • Increased price applies when near distance is greater than +6.00
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : editingId ? 'Update' : 'Add'} Configuration
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setFormData({
                type: '',
                coating: '',
                singleVisionBasePrice: '',
                singleVisionIncreasedPrice: '',
                bifocalBasePrice: '',
                bifocalIncreasedPrice: '',
                progressiveBasePrice: '',
                progressiveIncreasedPrice: ''
              });
              setEditingId(null);
            }}
            className="ml-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </form>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Existing Configurations</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="py-2 px-4 border">Type</th>
                <th className="py-2 px-4 border">Coating</th>
                <th className="py-2 px-4 border">Base Price</th>
                <th className="py-2 px-4 border">Increased Price</th>
                <th className="py-2 px-4 border">Prescription Range</th>
                <th className="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(lenses) && lenses.map((lens) => (
                <tr key={lens._id}>
                  <td className="py-2 px-4 border">{lens.type}</td>
                  <td className="py-2 px-4 border">{lens.coating}</td>
                  <td className="py-2 px-4 border">
                    NPR {getPriceForLens(lens)?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2 px-4 border">
                    NPR {getIncreasedPriceForLens(lens)?.toFixed(2) || '0.00'}
                  </td>
                  <td className="py-2 px-4 border">
                    {getPrescriptionRange(lens)}
                  </td>
                  <td className="py-2 px-4 border">
                    <button
                      onClick={() => handleEdit(lens)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lens._id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
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
    </div>
  );
};

export default LensPowerManagement;