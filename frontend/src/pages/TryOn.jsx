import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import VideoStream from "../components/tryon/VideoStream";
import axios from "axios";

function TryOn() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isStreamActive, setIsStreamActive] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const productId = searchParams.get("productId");
    
    useEffect(() => {
        // If productId is provided, fetch the product details
        if (productId) {
            const fetchProduct = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:5001/api/products/${productId}`);
                    
                    // Check if product has virtual try-on images
                    if (!response.data.virtualTryOnImages || response.data.virtualTryOnImages.length === 0) {
                        setError("This product doesn't have virtual try-on images available.");
                    } else {
                        setProduct(response.data);
                    }
                } catch (err) {
                    console.error("Error fetching product:", err);
                    setError("Failed to load product information.");
                } finally {
                    setLoading(false);
                }
            };
            
            fetchProduct();
        } else {
            // If no productId, we are loading the general try-on, stop loading
            setLoading(false);
            setError(null); // Clear any previous error
        }
    }, [productId]);
    
    const handleBackToProduct = () => {
        if (product) {
            navigate(`/product/${product._id}`);
        } else {
            navigate(-1); // Go back to previous page
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-center">Virtual Try-On</h1>
                <button 
                    onClick={handleBackToProduct}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                    Back to Product
                </button>
            </div>
            
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            ) : (
                <>
                    {/* Show product info only if product is loaded */}
                    {product && (
                        <div className="bg-gray-100 p-4 rounded-lg mb-6">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <img 
                                    src={product.images[0]} 
                                    alt={product.name} 
                                    className="w-32 h-32 object-contain bg-white rounded-lg"
                                />
                                <div>
                                    <h2 className="text-xl font-semibold">{product.name}</h2>
                                    <p className="text-gray-600">{product.brand}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)} • 
                                        {product.specifications.material} • 
                                        {product.specifications.gender.charAt(0).toUpperCase() + product.specifications.gender.slice(1)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Always show the start/stop buttons if not loading or error */}
                    <div className="flex justify-center mb-4 space-x-4">
                        <button
                            onClick={() => setIsStreamActive(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            disabled={isStreamActive}
                        >
                            Start Virtual Try-On
                        </button>
                        <button
                            onClick={() => setIsStreamActive(false)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                            disabled={!isStreamActive}
                        >
                            Stop Virtual Try-On
                        </button>
                    </div>
                    
                    {isStreamActive && (
                        <VideoStream 
                            productTryOnImages={product?.virtualTryOnImages} 
                            productId={productId}
                        />
                    )}
                </>
            )}
        </div>
    );
};
export default TryOn;
