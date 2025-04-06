import React, { useState } from 'react';

const FaceShapeGuide = () => {
    const [isOpen, setIsOpen] = useState(false);

    const faceShapes = [
        {
            shape: 'Oval',
            description: 'Balanced proportions with a slightly curved jawline.',
            recommendations: ['Aviator', 'Wayfarer', 'Square', 'Rectangle'],
            tips: 'Most frame styles work well with oval faces. You have the flexibility to experiment with different shapes.'
        },
        {
            shape: 'Round',
            description: 'Soft curves with similar width and length.',
            recommendations: ['Rectangle', 'Square', 'Geometric', 'Angular'],
            tips: 'Angular frames help add definition and make your face appear longer and thinner.'
        },
        {
            shape: 'Square',
            description: 'Strong jawline with similar width and length.',
            recommendations: ['Round', 'Oval', 'Curved', 'Rimless'],
            tips: 'Rounded frames help soften angular features and provide contrast to your face shape.'
        },
        {
            shape: 'Heart',
            description: 'Wider forehead with narrow chin.',
            recommendations: ['Round', 'Light-rimmed', 'Oval', 'Bottom-heavy'],
            tips: 'Frames that are wider at the bottom help balance your features.'
        }
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Face Shape Guide
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold">Face Shape Guide</h2>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid gap-6">
                                {faceShapes.map((face) => (
                                    <div key={face.shape} className="border rounded-lg p-4">
                                        <h3 className="text-xl font-semibold mb-2">{face.shape} Face</h3>
                                        <p className="text-gray-600 mb-3">{face.description}</p>
                                        <div className="mb-3">
                                            <h4 className="font-medium mb-1">Recommended Frames:</h4>
                                            <ul className="list-disc list-inside text-gray-600">
                                                {face.recommendations.map((rec) => (
                                                    <li key={rec}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <p className="text-sm text-gray-500 italic">{face.tips}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceShapeGuide;