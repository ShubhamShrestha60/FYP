import React from 'react';
 
const FrameCatalog = ({ onFrameSelect, productTryOnImages }) => {
    // Define product-specific frames if available
    const productFrames = productTryOnImages && productTryOnImages.length > 0 
        ? productTryOnImages.map((image, index) => ({
            id: `product_${index + 1}`, // Use a prefix to ensure unique keys
            name: `Style ${index + 1}`,
            style: 'Product',
            image: image,
            isProductImage: true
        }))
        : [];
        
    // Define default frames that should always be available
    const defaultFrames = [
        { id: 1, name: 'Classic Aviator', style: 'Aviator', image: 'sunglasses.png', isDefaultFrame: true },
        { id: 2, name: 'Modern Round', style: 'Round', image: 'sunglasses1.png', isDefaultFrame: true },
        { id: 3, name: 'Square Elite', style: 'Square', image: 'sunglasses2.png', isDefaultFrame: true },
        { id: 4, name: 'Vintage Oval', style: 'Oval', image: 'sunglasses3.png', isDefaultFrame: true }
    ];
    
    // Determine which frames to display based on how the component is accessed
    // If productTryOnImages is provided, we're accessing from a specific product
    // and should show product frames first, then default frames
    // If no productTryOnImages, we're accessing directly from try-on tab
    // and should only show default frames
    const framesToDisplay = productTryOnImages && productTryOnImages.length > 0
        ? [...productFrames, ...defaultFrames] // Product-specific access: show product frames and default frames
        : defaultFrames; // Direct access: show only default frames

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Select Frame Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {framesToDisplay.map((frame) => (
                    <div
                        key={frame.id}
                        className="cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                        onClick={() => onFrameSelect(frame.isProductImage ? frame.image : `/sunglasses/${frame.image}`)}
                    >
                        <img
                            src={frame.isProductImage ? frame.image : `/sunglasses/${frame.image}`}
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