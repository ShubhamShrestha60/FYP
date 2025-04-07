import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const LensPowerManagement = () => {
    const [lensTypes, setLensTypes] = useState([]);
    const [formData, setFormData] = useState({
        type: '', // single vision, bifocal, progressive
        coating: '', // Blue Ray Cut, Normal, Combo
        powerRanges: {
            sphere: {
                range0to6: '', // Base price for 0 to -6
                above6: ''     // Additional price for powers above -6
            },
            cylinder: {
                range0to2: '', // Base price for 0 to -2
                above2: ''     // Additional price for powers above -2
            }
        }
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLensTypes();
    }, []);

    const fetchLensTypes = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/lens');
            if (response.data && Array.isArray(response.data.data)) {
                setLensTypes(response.data.data);
            } else {
                console.error('Invalid response format:', response.data);
                toast.error('Error: Invalid data format received from server');
            }
        } catch (error) {
            toast.error('Error fetching lens types');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child, subChild] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: subChild ? {
                        ...prev[parent][child],
                        [subChild]: value
                    } : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.type) {
            newErrors.type = 'Lens type is required';
        }
        if (!formData.coating) {
            newErrors.coating = 'Coating type is required';
        }
        
        // Validate sphere power ranges
        if (!formData.powerRanges.sphere.range0to6) {
            newErrors['sphere.range0to6'] = 'Base price for sphere power (0 to -6) is required';
        } else if (isNaN(formData.powerRanges.sphere.range0to6) || Number(formData.powerRanges.sphere.range0to6) <= 0) {
            newErrors['sphere.range0to6'] = 'Please enter a valid positive number';
        }
        
        if (!formData.powerRanges.sphere.above6) {
            newErrors['sphere.above6'] = 'Additional price for sphere power (above -6) is required';
        } else if (isNaN(formData.powerRanges.sphere.above6) || Number(formData.powerRanges.sphere.above6) <= 0) {
            newErrors['sphere.above6'] = 'Please enter a valid positive number';
        }
        
        // Validate cylinder power ranges
        if (!formData.powerRanges.cylinder.range0to2) {
            newErrors['cylinder.range0to2'] = 'Base price for cylinder power (0 to -2) is required';
        } else if (isNaN(formData.powerRanges.cylinder.range0to2) || Number(formData.powerRanges.cylinder.range0to2) <= 0) {
            newErrors['cylinder.range0to2'] = 'Please enter a valid positive number';
        }
        
        if (!formData.powerRanges.cylinder.above2) {
            newErrors['cylinder.above2'] = 'Additional price for cylinder power (above -2) is required';
        } else if (isNaN(formData.powerRanges.cylinder.above2) || Number(formData.powerRanges.cylinder.above2) <= 0) {
            newErrors['cylinder.above2'] = 'Please enter a valid positive number';
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            setIsSubmitting(false);
            toast.error('Please fix the form errors');
            return;
        }
        
        try {
            // Convert power range values to numbers
            const processedFormData = {
                ...formData,
                powerRanges: {
                    sphere: {
                        range0to6: Number(formData.powerRanges.sphere.range0to6),
                        above6: Number(formData.powerRanges.sphere.above6)
                    },
                    cylinder: {
                        range0to2: Number(formData.powerRanges.cylinder.range0to2),
                        above2: Number(formData.powerRanges.cylinder.above2)
                    }
                }
            };
            const response = await axios.post('http://localhost:5001/api/lens', processedFormData);
            toast.success('Lens power and price added successfully');
            fetchLensTypes();
            // Reset form and errors
            setFormData({
                type: '',
                coating: '',
                powerRanges: {
                    sphere: {
                        range0to6: '',
                        above6: ''
                    },
                    cylinder: {
                        range0to2: '',
                        above2: ''
                    }
                }
            });
            setErrors({});
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error adding lens power and price');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Lens Power Management</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Lens Type Selection */}
                <div>
                    <label className="block mb-2">Lens Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${errors.type ? 'border-red-500' : ''}`}
                        required
                    >
                        <option value="">Select Type</option>
                        <option value="Single Vision">Single Vision</option>
                        <option value="Bifocal">Bifocal</option>
                        <option value="Progressive">Progressive</option>
                    </select>
                    {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                </div>

                {/* Coating Type */}
                <div>
                    <label className="block mb-2">Coating Type</label>
                    <select
                        name="coating"
                        value={formData.coating}
                        onChange={handleInputChange}
                        className={`w-full p-2 border rounded ${errors.coating ? 'border-red-500' : ''}`}
                        required
                    >
                        <option value="">Select Coating</option>
                        <option value="Normal">Normal</option>
                        <option value="Blue Ray Cut">Blue Ray Cut</option>
                        <option value="Combo">Combo</option>
                    </select>
                    {errors.coating && <p className="text-red-500 text-sm mt-1">{errors.coating}</p>}
                </div>

                {/* Sphere Power Pricing */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Sphere Power Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Price (0 to -6)</label>
                            <input
                                type="number"
                                name="powerRanges.sphere.range0to6"
                                value={formData.powerRanges.sphere.range0to6}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${errors['sphere.range0to6'] ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors['sphere.range0to6'] && <p className="text-red-500 text-sm mt-1">{errors['sphere.range0to6']}</p>}
                        </div>
                        <div>
                            <label className="block mb-2">Additional Price (Above -6)</label>
                            <input
                                type="number"
                                name="powerRanges.sphere.above6"
                                value={formData.powerRanges.sphere.above6}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${errors['sphere.above6'] ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors['sphere.above6'] && <p className="text-red-500 text-sm mt-1">{errors['sphere.above6']}</p>}
                        </div>
                    </div>
                </div>

                {/* Cylinder Power Pricing */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Cylinder Power Pricing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-2">Price (0 to -2)</label>
                            <input
                                type="number"
                                name="powerRanges.cylinder.range0to2"
                                value={formData.powerRanges.cylinder.range0to2}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${errors['cylinder.range0to2'] ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors['cylinder.range0to2'] && <p className="text-red-500 text-sm mt-1">{errors['cylinder.range0to2']}</p>}
                        </div>
                        <div>
                            <label className="block mb-2">Additional Price (Above -2)</label>
                            <input
                                type="number"
                                name="powerRanges.cylinder.above2"
                                value={formData.powerRanges.cylinder.above2}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${errors['cylinder.above2'] ? 'border-red-500' : ''}`}
                                required
                            />
                            {errors['cylinder.above2'] && <p className="text-red-500 text-sm mt-1">{errors['cylinder.above2']}</p>}
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'Add Lens Configuration'}
                </button>
            </form>

            {/* Display existing configurations */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Existing Lens Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {lensTypes.map((lens, index) => (
                        <div key={index} className="border p-4 rounded">
                            <h4 className="font-bold">{lens.type} - {lens.coating}</h4>
                            <div className="mt-2">
                                <p className="font-semibold">Sphere Power Pricing:</p>
                                <ul className="list-disc list-inside">
                                    <li>0 to -6: Rs. {lens.powerRanges.sphere.range0to6}</li>
                                    <li>Above -6: +Rs. {lens.powerRanges.sphere.above6}</li>
                                </ul>
                            </div>
                            <div className="mt-2">
                                <p className="font-semibold">Cylinder Power Pricing:</p>
                                <ul className="list-disc list-inside">
                                    <li>0 to -2: Rs. {lens.powerRanges.cylinder.range0to2}</li>
                                    <li>Above -2: +Rs. {lens.powerRanges.cylinder.above2}</li>
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