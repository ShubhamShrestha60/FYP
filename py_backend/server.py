import cv2
import mediapipe as mp
import numpy as np
import base64
import asyncio
import websockets
from io import BytesIO
from PIL import Image

# Load FaceMesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False, max_num_faces=1, min_detection_confidence=0.5)

# Load sunglasses image (ensure it's transparent PNG)
try:
    sunglasses_img = cv2.imread("sunglasses/sunglasses.png", cv2.IMREAD_UNCHANGED)
    if sunglasses_img is None:
        raise FileNotFoundError("Sunglasses image not found")
except Exception as e:
    print(f"Error loading sunglasses image: {e}")
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
    try:
        async for message in websocket:
            nparr = np.frombuffer(message, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            processed_frame = overlay_sunglasses(frame, sunglasses_img)
            
            _, buffer = cv2.imencode(".jpg", processed_frame)
            encoded_image = base64.b64encode(buffer).decode("utf-8")
            await websocket.send(encoded_image)
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected")
    except Exception as e:
        print(f"Error processing image: {e}")

# Update the main function
async def main():
    async with websockets.serve(process_image, "localhost", 8000):
        print("WebSocket server started on ws://localhost:8000")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())
