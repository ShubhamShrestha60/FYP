from flask import Flask, Response, jsonify
from flask_cors import CORS
from virtual_tryon import VirtualTryOn
import cv2
import threading
import subprocess
import sys
import os

app = Flask(__name__)
CORS(app)

# Global variable to store VirtualTryOn instance
tryon_instance = None
tryon_lock = threading.Lock()

def get_tryon_instance():
    global tryon_instance
    if tryon_instance is None:
        with tryon_lock:
            if tryon_instance is None:
                # Create instance in headless mode
                tryon_instance = VirtualTryOn(headless=True)
    return tryon_instance

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "virtual-tryon"})

def generate_frames():
    tryon = get_tryon_instance()
    while True:
        if tryon.cap is None:
            tryon.start()
        
        ret, frame = tryon.cap.read()
        if not ret:
            break
            
        # Process frame using virtual_tryon logic
        frame = cv2.flip(frame, 1)  # Mirror image
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        h, w = frame.shape[:2]

        results = tryon.face_mesh.process(rgb_frame)
        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            
            # Get key points and apply frame overlay
            frame = tryon.process_video_frame(frame, face_landmarks)
        
        # Convert frame to bytes
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/start', methods=['POST'])
def start_tryon():
    try:
        # Launch the Tkinter application in a separate process
        python_executable = sys.executable
        virtual_tryon_path = os.path.join(os.path.dirname(__file__), 'virtual_tryon.py')
        subprocess.Popen([python_executable, virtual_tryon_path])
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop_tryon():
    try:
        tryon = get_tryon_instance()
        if tryon.cap is not None:
            tryon.cap.release()
            tryon.cap = None
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 