import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LensPowerManagement = () => {
    const [lensTypes, setLensTypes] = useState([]);
    const [formData, setFormData] = useState({
        type: '',
        material: '',
        powerRange: {
            min: '',
            max: ''
        },
        basePrice: '',
        additionalFeaturesPrices: {
            antiReflective: '',
            blueLight: '',
            photochromic: ''
        }
    });

    useEffect(() => {
        fetchLensTypes();
    }, []);

    const fetchLensTypes = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/lens');
            setLensTypes(response.data);
        } catch (error) {
            toast.error('Error fetching lens types');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/api/lens', formData);
            toast.success('Lens power and price added successfully');
            fetchLensTypes();
            setFormData({
                type: '',
                material: '',
                powerRange: { min: '', max: '' },
                basePrice: '',
                additionalFeaturesPrices: {
                    antiReflective: '',
                    blueLight: '',
                    photochromic: ''
                }
            });
        } catch (error) {
            toast.error('Error adding lens power and price');
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Lens Power Management</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <label className="block mb-2">Material</label>
                    <select
                        name="material"
                        value={formData.material}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="">Select Material</option>
                        <option value="CR39">CR39</option>
                        <option value="Polycarbonate">Polycarbonate</option>
                        <option value="High Index 1.67">High Index 1.67</option>
                        <option value="High Index 1.74">High Index 1.74</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2">Min Power</label>
                        <input
                            type="number"
                            name="powerRange.min"
                            value={formData.powerRange.min}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                            step="0.25"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Max Power</label>
                        <input
                            type="number"
                            name="powerRange.max"
                            value={formData.powerRange.max}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                            required
                            step="0.25"
                        />
                    </div>
                </div>

                <div>
                    <label className="block mb-2">Base Price</label>
                    <input
                        type="number"
                        name="basePrice"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold">Additional Features Prices</h3>
                    <div>
                        <label className="block mb-2">Anti-Reflective Coating</label>
                        <input
                            type="number"
                            name="additionalFeaturesPrices.antiReflective"
                            value={formData.additionalFeaturesPrices.antiReflective}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Blue Light Filter</label>
                        <input
                            type="number"
                            name="additionalFeaturesPrices.blueLight"
                            value={formData.additionalFeaturesPrices.blueLight}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-2">Photochromic</label>
                        <input
                            type="number"
                            name="additionalFeaturesPrices.photochromic"
                            value={formData.additionalFeaturesPrices.photochromic}
                            onChange={handleInputChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Lens Configuration
                </button>
            </form>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Existing Lens Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lensTypes.map((lens, index) => (
                        <div key={index} className="border p-4 rounded">
                            <h4 className="font-bold">{lens.type} - {lens.material}</h4>
                            <p>Power Range: {lens.powerRange.min} to {lens.powerRange.max}</p>
                            <p>Base Price: Rs. {lens.basePrice}</p>
                            <div className="mt-2">
                                <p className="font-semibold">Additional Features:</p>
                                <ul className="list-disc list-inside">
                                    <li>Anti-Reflective: Rs. {lens.additionalFeaturesPrices.antiReflective}</li>
                                    <li>Blue Light: Rs. {lens.additionalFeaturesPrices.blueLight}</li>
                                    <li>Photochromic: Rs. {lens.additionalFeaturesPrices.photochromic}</li>
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LensPowerManagement;