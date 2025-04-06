import React from 'react';

const FrameCatalog = ({ onFrameSelect }) => {
    const frames = [
        { id: 1, name: 'Classic Aviator', style: 'Aviator', image: 'sunglasses.png' },
        { id: 2, name: 'Modern Round', style: 'Round', image: 'sunglasses1.png' },
        { id: 3, name: 'Square Elite', style: 'Square', image: 'sunglasses2.png' },
        { id: 4, name: 'Vintage Oval', style: 'Oval', image: 'sunglasses3.png' }
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Select Frame Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {frames.map((frame) => (
                    <div
                        key={frame.id}
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={() => onFrameSelect(frame.image)}
                    >
                        <img
                            src={`/sunglasses/${frame.image}`}
                            alt={frame.name}
                            className="w-full h-auto object-contain mb-2"
                        />
                        <p className="text-sm text-center font-medium">{frame.name}</p>
                        <p className="text-xs text-center text-gray-500">{frame.style}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FrameCatalog;