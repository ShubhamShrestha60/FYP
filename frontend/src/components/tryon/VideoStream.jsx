import React, { useEffect, useRef, useState } from "react";
import FrameCatalog from "./FrameCatalog";
import FaceShapeGuide from "./FaceShapeGuide";

const VideoStream = ({ productTryOnImages, productId }) => {
    // Add new state for face detection and frame adjustments
    const [faceDetected, setFaceDetected] = useState(false);
    const [frameAdjustments, setFrameAdjustments] = useState({ x: 0, y: 0, scale: 1 });
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [ws, setWs] = useState(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFrame, setSelectedFrame] = useState('sunglasses.png');
    const streamRef = useRef(null);
    const frameIntervalRef = useRef(null);

    useEffect(() => {
        let wsClient = null;
        const connectWebSocket = () => {
            wsClient = new WebSocket("ws://localhost:8000/ws");
            
            wsClient.onopen = () => {
                console.log("Connected to WebSocket server");
                setWs(wsClient);
                setError(null);
            };

            wsClient.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Handle JSON messages (status updates, frame switches)
                    if (data.status) {
                        console.log(data.message);
                        return;
                    } else if (data.type === 'face_detection') {
                        setFaceDetected(data.detected);
                        if (data.image) setProcessedImage(data.image);
                    }
                } catch (e) {
                    // Handle binary image data
                    setProcessedImage(event.data);
                }
            };

            wsClient.onerror = (error) => {
                console.error("WebSocket error:", error);
                setError("Failed to connect to server");
            };

            wsClient.onclose = () => {
                console.log("Disconnected from WebSocket server");
                setError("Connection closed");
                setWs(null);
            };
        };

        connectWebSocket();

        return () => {
            if (wsClient && wsClient.readyState === WebSocket.OPEN) {
                wsClient.close();
            }
            setWs(null);
            setProcessedImage(null);
        };
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        let isComponentMounted = true;

        const startVideoStream = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Ensure previous stream is fully cleaned up
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
                if (video) {
                    video.srcObject = null;
                }

                // Add small delay to ensure cleanup is complete
                await new Promise(resolve => setTimeout(resolve, 300));

                if (!isComponentMounted) return;

                if (navigator.mediaDevices.getUserMedia) {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (!isComponentMounted || !videoRef.current) return;

                    streamRef.current = mediaStream;
                    video.srcObject = mediaStream;
                    await video.play();

                    // Start sending frames only after video is playing
                    frameIntervalRef.current = setInterval(() => {
                        if (!ws || ws.readyState !== WebSocket.OPEN || !video.srcObject) return;

                        const canvas = canvasRef.current;
                        if (!canvas) return;

                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        canvas.toBlob((blob) => ws.send(blob), "image/jpeg");
                    }, 100);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                if (isComponentMounted) {
                    setError("Failed to access webcam");
                    setIsLoading(false);
                }
            }
        };

        const cleanup = () => {
            isComponentMounted = false;
            if (frameIntervalRef.current) {
                clearInterval(frameIntervalRef.current);
                frameIntervalRef.current = null;
            }

            if (video) {
                video.srcObject = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }
        };

        startVideoStream();
        return cleanup;
    }, [ws]);

    useEffect(() => {
        if (productTryOnImages && productTryOnImages.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
            const initialFrameUrl = productTryOnImages[0];
            // Only select if the currently selected frame is the default or no frame is selected
            if (selectedFrame === 'sunglasses.png' || selectedFrame === '') {
                 setSelectedFrame(initialFrameUrl);
                 // Send the initial frame to the backend
                 const frameId = `cloudinary_${initialFrameUrl.split('/').pop().split('.')[0]}`;
                 ws.send(JSON.stringify({
                     type: 'frame_select',
                     frame: frameId,
                     frame_url: initialFrameUrl
                 }));
            }
        }
    }, [productTryOnImages, ws, selectedFrame]);

    const handleFrameSelect = (frameImage) => {
        setSelectedFrame(frameImage);
        // Send frame selection to backend
        if (ws && ws.readyState === WebSocket.OPEN) {
            // Check if this is a Cloudinary URL (product try-on image)
            if (frameImage.startsWith('http')) {
                // Generate a unique frame ID based on the URL
                const frameId = `cloudinary_${frameImage.split('/').pop().split('.')[0]}`;
                ws.send(JSON.stringify({
                    type: 'frame_select',
                    frame: frameId,
                    frame_url: frameImage
                }));
            } else {
                // For local frames, use the default frame ID format
                const frameName = frameImage.includes('/') 
                    ? frameImage.split('/').pop() 
                    : frameImage;
                ws.send(JSON.stringify({
                    type: 'frame_select',
                    frame: `default_${frameName}`
                }));
            }
        }
    };

    const handleScreenshot = () => {
        if (processedImage) {
            const link = document.createElement('a');
            link.href = `data:image/jpeg;base64,${processedImage}`;
            link.download = 'virtual-tryon.jpg';
            link.click();
        }
    };

    const handleShare = async () => {
        if (processedImage && navigator.share) {
            try {
                const blob = await (await fetch(`data:image/jpeg;base64,${processedImage}`)).blob();
                const file = new File([blob], 'virtual-tryon.jpg', { type: 'image/jpeg' });
                await navigator.share({
                    title: 'My Virtual Try-On',
                    text: 'Check out how I look with these frames!',
                    files: [file]
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    // Add frame adjustment handler
    const adjustFrame = (adjustment) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const newAdjustments = { ...frameAdjustments };
            
            switch(adjustment) {
                case 'left': newAdjustments.x -= 5; break;
                case 'right': newAdjustments.x += 5; break;
                case 'up': newAdjustments.y -= 5; break;
                case 'down': newAdjustments.y += 5; break;
                case 'bigger': newAdjustments.scale += 0.1; break;
                case 'smaller': newAdjustments.scale -= 0.1; break;
            }

            setFrameAdjustments(newAdjustments);
            ws.send(JSON.stringify({
                type: 'adjust_frame',
                adjustments: newAdjustments
            }));
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 relative bg-gray-100 rounded-lg overflow-hidden">
                    <video ref={videoRef} style={{ display: "none" }} />
                    <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }} />
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                            <p className="text-lg">Loading camera...</p>
                        </div>
                    )}
                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75">
                            <p className="text-lg text-red-600">{error}</p>
                        </div>
                    )}
                    {processedImage && (
                        <div className="relative">
                            <img 
                                src={`data:image/jpeg;base64,${processedImage}`} 
                                alt="Processed Video"
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                            {/* Add frame adjustment controls */}
                            <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-2 text-white">
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => adjustFrame('left')} className="p-2 hover:bg-white/20 rounded">←</button>
                                    <button onClick={() => adjustFrame('up')} className="p-2 hover:bg-white/20 rounded">↑</button>
                                    <button onClick={() => adjustFrame('right')} className="p-2 hover:bg-white/20 rounded">→</button>
                                    <button onClick={() => adjustFrame('down')} className="p-2 hover:bg-white/20 rounded">↓</button>
                                    <button onClick={() => adjustFrame('bigger')} className="p-2 hover:bg-white/20 rounded">+</button>
                                    <button onClick={() => adjustFrame('smaller')} className="p-2 hover:bg-white/20 rounded">-</button>
                                </div>
                            </div>
                            {/* Add face detection indicator */}
                            {!faceDetected && (
                                <div className="absolute top-4 right-4 bg-yellow-500/90 text-white px-4 py-2 rounded-lg">
                                    Center your face in the frame
                                </div>
                            )}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={handleScreenshot}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                    </svg>
                                    Screenshot
                                </button>
                                {navigator.share && (
                                    <button
                                        onClick={handleShare}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                        </svg>
                                        Share
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="md:col-span-1 space-y-4">
                    <FrameCatalog 
                        onFrameSelect={handleFrameSelect} 
                        productTryOnImages={productTryOnImages} 
                    />
                    <FaceShapeGuide />
                </div>
            </div>
        </div>
    );
};

export default VideoStream;
