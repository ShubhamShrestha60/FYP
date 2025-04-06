import React, { useState } from "react";
import VideoStream from "../components/tryon/VideoStream";

function TryOn() {
    const [isStreamActive, setIsStreamActive] = useState(false);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Virtual Try-On</h1>
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
            {isStreamActive && <VideoStream />}
        </div>
    )
};
export default TryOn;
