import cv2
import mediapipe as mp
import numpy as np
import base64
import asyncio
import websockets
import json
import requests
from io import BytesIO
from PIL import Image
import hashlib
import os
import aiohttp
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Load FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5)

# Create cache directory if it doesn't exist
CACHE_DIR = "sunglasses_cache"
os.makedirs(CACHE_DIR, exist_ok=True)

# Global frame cache
frames = {}
frame_cache = {}  # Shared cache for all frames
frame_lock = asyncio.Lock()  # Lock for thread-safe cache access
executor = ThreadPoolExecutor(max_workers=4)  # Thread pool for processing frames

async def preprocess_frame(frame_data, frame_id):
    """Preprocess a frame to optimize it for virtual try-on"""
    try:
        # Convert to numpy array if it's a URL
        if isinstance(frame_data, str) and frame_data.startswith('http'):
            async with aiohttp.ClientSession() as session:
                async with session.get(frame_data) as response:
                    if response.status != 200:
                        return None
                    frame_bytes = await response.read()
                    frame_array = np.frombuffer(frame_bytes, np.uint8)
                    frame = cv2.imdecode(frame_array, cv2.IMREAD_UNCHANGED)
        else:
            frame = frame_data

        if frame is None:
            return None

        # Ensure frame has alpha channel
        if frame.shape[2] == 3:
            frame = cv2.cvtColor(frame, cv2.COLOR_BGR2BGRA)

        # Optimize frame size (resize if too large)
        max_dimension = 800
        height, width = frame.shape[:2]
        if max(height, width) > max_dimension:
            scale = max_dimension / max(height, width)
            frame = cv2.resize(frame, (int(width * scale), int(height * scale)))

        # Save processed frame to cache
        cache_path = os.path.join(CACHE_DIR, f"{frame_id}.png")
        cv2.imwrite(cache_path, frame)
        
        return frame
    except Exception as e:
        print(f"Error preprocessing frame: {e}")
        return None

async def get_or_load_frame(frame_id, frame_url=None):
    """Get a frame from cache or load it if not present"""
    async with frame_lock:
        # Check if frame is already in memory
        if frame_id in frame_cache:
            return frame_cache[frame_id]

        # Check if frame is in disk cache
        cache_path = os.path.join(CACHE_DIR, f"{frame_id}.png")
        if os.path.exists(cache_path):
            frame = cv2.imread(cache_path, cv2.IMREAD_UNCHANGED)
            if frame is not None:
                frame_cache[frame_id] = frame
                return frame

        # If frame_url is provided, download and process it
        if frame_url:
            frame = await preprocess_frame(frame_url, frame_id)
            if frame is not None:
                frame_cache[frame_id] = frame
                return frame

        return None

# Load default frames
try:
    frame_files = [
        "sunglasses.png", "sunglasses1.png", "sunglasses2.png", "sunglasses3.png",
        "toppng.com-aviator-sunglasses-transparent-935x359.png",
        "—Pngtree—sunglasses_5643842.png"
    ]
    for frame_file in frame_files:
        frame_path = f"sunglasses/{frame_file}"
        frame = cv2.imread(frame_path, cv2.IMREAD_UNCHANGED)
        if frame is not None:
            frame_id = f"default_{frame_file}"
            frames[frame_id] = frame
            frame_cache[frame_id] = frame
        else:
            print(f"Warning: Could not load frame {frame_file}")
    
    if not frames:
        raise FileNotFoundError("No default frames found")
    
    # Set default frame
    default_frame = f"default_{frame_files[0]}"
except Exception as e:
    print(f"Error loading default frames: {e}")
    exit(1)

# Overlay function
def overlay_sunglasses(frame, sunglasses):
    h, w, _ = frame.shape
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)

    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            left_eye = [
                (face_landmarks.landmark[33].x + face_landmarks.landmark[133].x) / 2,
                (face_landmarks.landmark[33].y + face_landmarks.landmark[133].y) / 2
            ]
            right_eye = [
                (face_landmarks.landmark[362].x + face_landmarks.landmark[263].x) / 2,
                (face_landmarks.landmark[362].y + face_landmarks.landmark[263].y) / 2
            ]
            left_eye = (int(left_eye[0] * w), int(left_eye[1] * h))
            right_eye = (int(right_eye[0] * w), int(right_eye[1] * h))
            eye_center_x = (left_eye[0] + right_eye[0]) // 2
            eye_center_y = (left_eye[1] + right_eye[1]) // 2
            eye_distance = int(np.linalg.norm(np.array(left_eye) - np.array(right_eye)))
            overlay_width = int(eye_distance * 2.37)
            overlay_height = int(overlay_width * 0.65)
            overlay_x = eye_center_x - overlay_width // 2
            overlay_y = int(eye_center_y - overlay_height * 0.5)

            if 0 <= overlay_x < w and 0 <= overlay_y < h:
                sunglasses_resized = cv2.resize(sunglasses, (overlay_width, overlay_height))
                for c in range(3):
                    alpha = sunglasses_resized[..., 3] / 255.0
                    frame[overlay_y:overlay_y + overlay_height, overlay_x:overlay_x + overlay_width, c] = (
                        sunglasses_resized[..., c] * alpha +
                        frame[overlay_y:overlay_y + overlay_height, overlay_x:overlay_x + overlay_width, c] * (1 - alpha)
                    )

    return frame

# WebSocket Server
# Update the process_image function signature
async def process_image(websocket):
    # Initialize current frame for this connection
    current_frame = frame_cache[default_frame]
    
    try:
        async for message in websocket:
            # Handle both binary data and JSON messages
            if isinstance(message, str):
                try:
                    data = json.loads(message)
                    if 'frame' in data:
                        frame_id = data['frame']
                        frame_url = data.get('frame_url')
                        
                        # Get or load the frame
                        frame = await get_or_load_frame(frame_id, frame_url)
                        
                        if frame is not None:
                            current_frame = frame
                            response = {"status": "success", "message": "Frame loaded successfully"}
                        else:
                            response = {"status": "error", "message": "Failed to load frame"}
                        await websocket.send(json.dumps(response))
                    continue
                except json.JSONDecodeError:
                    print("Invalid JSON message received")
                    continue
            
            # Process binary image data
            try:
                nparr = np.frombuffer(message, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                if frame is None:
                    print("Failed to decode image")
                    continue
                
                processed_frame = overlay_sunglasses(frame, current_frame)
                
                _, buffer = cv2.imencode(".jpg", processed_frame)
                encoded_image = base64.b64encode(buffer).decode("utf-8")
                await websocket.send(encoded_image)
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue
                
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error in WebSocket connection: {e}")


# Update the main function
async def main():
    async with websockets.serve(process_image, "localhost", 8000):
        print("WebSocket server started on ws://localhost:8000")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
