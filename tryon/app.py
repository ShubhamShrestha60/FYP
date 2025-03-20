import logging
logging.getLogger('werkzeug').setLevel(logging.ERROR)
logging.getLogger('mediapipe').setLevel(logging.ERROR)

from flask import Flask, Response, jsonify
from flask_cors import CORS
from virtual_tryon import VirtualTryOn
import cv2
import threading
import sys
import os
import subprocess

app = Flask(__name__)
CORS(app)

# Global variable to store VirtualTryOn instance
tryon_instance = None
tryon_lock = threading.Lock()

tryon_process = None

def get_tryon_instance():
    global tryon_instance
    if tryon_instance is None:
        with tryon_lock:
            if tryon_instance is None:
                tryon_instance = VirtualTryOn(web_mode=True)
    return tryon_instance

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/collections', methods=['GET'])
def get_collections():
    try:
        tryon = get_tryon_instance()
        collections_data = {}
        
        # Convert the collections data to a JSON-serializable format
        for collection_name, frames in tryon.collections.items():
            collections_data[collection_name] = [
                {
                    'name': frame['name'],
                    'path': frame['path']
                } for frame in frames
            ]
        
        return jsonify(collections_data)
    except Exception as e:
        print(f"Error getting collections: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

def generate_frames():
    tryon = get_tryon_instance()
    while True:
        frame = tryon.get_frame()
        if frame is None:
            break
            
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/start-stream', methods=['POST'])
def start_stream():
    try:
        tryon = get_tryon_instance()
        tryon.start()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/stop-stream', methods=['POST'])
def stop_stream():
    try:
        tryon = get_tryon_instance()
        tryon.stop()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/launch', methods=['POST'])
def launch_tryon():
    global tryon_process
    try:
        # Check if process is already running
        if tryon_process and tryon_process.poll() is None:
            return jsonify({"success": True, "message": "Already running"})

        # Launch the Tkinter application
        python_executable = sys.executable
        virtual_tryon_path = os.path.join(os.path.dirname(__file__), 'virtual_tryon.py')
        
        # Use a different process creation method based on the OS
        if sys.platform.startswith('win'):
            # On Windows, use CREATE_NO_WINDOW to hide console
            from subprocess import CREATE_NO_WINDOW
            tryon_process = subprocess.Popen(
                [python_executable, virtual_tryon_path],
                creationflags=CREATE_NO_WINDOW
            )
        else:
            # On Unix-like systems
            tryon_process = subprocess.Popen(
                [python_executable, virtual_tryon_path],
                start_new_session=True
            )
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 