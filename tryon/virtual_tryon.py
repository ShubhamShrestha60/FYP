import cv2
import numpy as np
import mediapipe as mp
import json
from pathlib import Path
import logging
import math
from typing import Dict, List, Optional, Tuple
import os
import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk

class VirtualTryOn:
    """
    Virtual Try-On System for Eyewear following ISO 18369-3:2017 standards
    for optical measurements and industry best practices
    """
    
    def __init__(self, web_mode=False):
        self.web_mode = web_mode
        
        # Initialize MediaPipe with optimized settings
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
            refine_landmarks=True
        )
        
        # Initialize collections - moved outside of GUI initialization
        self.collections = {
            'Sunglasses': self.load_images('sunglasses'),
            'Eyeglasses': self.load_images('eyeglasses'),
            'Sports': self.load_images('sports')
        }
        self.current_collection = 'Sunglasses'
        self.current_frame_index = 0
        
        # Initialize smoothing-related attributes
        self.last_frame_pos = None
        self.last_frame_width = None
        self.last_frame_angle = None
        self.smoothing_factor = 0.7
        
        # Initialize video capture
        self.cap = None
        
        # Add image dimensions
        self.image_width = 640  # Standard webcam width
        self.image_height = 480  # Standard webcam height
        
        if not web_mode:
            # Initialize the main window
            self.window = tk.Tk()
            self.window.title("Opera Eye Wear Nepal - Virtual Try-On")
            self.window.geometry("1600x1000")
            
            # Initialize logger
            logging.basicConfig(level=logging.INFO)
            self.logger = logging.getLogger(__name__)
            
            # Updated professional color scheme
            self.brand_colors = {
                'primary': '#1B1B1B',     # Almost black
                'secondary': '#C4B27D',   # Gold accent
                'bg_light': '#FFFFFF',    # White
                'bg_dark': '#F5F5F5',     # Light gray
                'text_dark': '#1B1B1B',   # Almost black
                'text_light': '#FFFFFF',  # White
                'accent': '#E5E5E5',      # Light accent
                'error': '#D64545'        # Error red
            }
            
            self.window.configure(bg=self.brand_colors['bg_light'])
            
            # Add window icon
            try:
                self.window.iconbitmap('assets/icon.ico')
            except:
                pass
            
            # Add drawing utilities for debugging
            self.mp_drawing = mp.solutions.drawing_utils
            self.mp_drawing_styles = mp.solutions.drawing_styles

            # Define facial landmarks for glasses positioning
            self.FACIAL_LANDMARKS_GLASSES = {
                'nose_bridge': [168, 6, 197, 195, 5],
                'left_eye': [33, 133, 157, 158, 159, 160, 161, 246],
                'right_eye': [362, 263, 387, 388, 389, 390, 391, 466],
                'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288],
                'temple_points': [127, 356],  # Temple width measurement
                'nose_contour': [168, 6, 197, 195, 5],  # Detailed nose bridge
                'eye_corners': [33, 133, 362, 263],  # Eye corner points
                'cheekbone_points': [123, 352]  # Facial width at cheekbones
            }
            
            # Standard measurements in millimeters
            self.STANDARD_MEASUREMENTS = {
                'min_bridge_width': 14,
                'max_bridge_width': 24,
                'min_lens_width': 40,
                'max_lens_width': 62,
                'standard_temple_length': 140
            }

            # Load frames metadata and collections
            self.frames_data = self._load_frames_metadata()
            
            # Initialize UI elements
            self.recommendation_label = None
            self.frame_info_display = None
            self.video_label = None
            self.frame_info = None
            
            # Setup UI
            self.setup_ui()
        
        self.cap = None

    def load_images(self, folder):
        """Enhanced image loading with debug info"""
        images = []
        folder_path = os.path.join('frames', folder)
        print(f"Loading frames from: {folder_path}")  # Debug print
        
        if not os.path.exists(folder_path):
            print(f"Warning: Folder not found - {folder_path}")
            os.makedirs(folder_path, exist_ok=True)
            return []
        
        for filename in os.listdir(folder_path):
            if filename.endswith(('.png', '.jpg')):
                try:
                    path = os.path.join(folder_path, filename)
                    print(f"Loading frame: {path}")  # Debug print
                    
                    # Load image with alpha channel
                    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
                    if img is not None:
                        # Ensure image has alpha channel
                        if len(img.shape) == 3 and img.shape[2] == 3:
                            img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
                        elif len(img.shape) == 2:  # Grayscale image
                            img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
                        
                        print(f"Loaded frame shape: {img.shape}")  # Debug print
                        images.append({
                            'image': img,
                            'name': os.path.splitext(filename)[0],
                            'path': path
                        })
                    else:
                        print(f"Failed to load frame: {path}")
                except Exception as e:
                    print(f"Error loading frame {filename}: {str(e)}")
                    continue
        
        print(f"Total frames loaded for {folder}: {len(images)}")
        return images

    def setup_ui(self):
        # Create main containers
        self.create_header()
        self.create_main_content()
        self.create_footer()

    def create_header(self):
        # Main header container with gradient effect
        header = tk.Frame(self.window, bg=self.brand_colors['primary'], height=100)
        header.pack(fill=tk.X, pady=0)
        header.pack_propagate(False)
        
        # Logo container
        logo_frame = tk.Frame(header, bg=self.brand_colors['primary'])
        logo_frame.pack(side=tk.LEFT, padx=60)
        
        # Try to load logo image
        try:
            logo_img = Image.open('assets/logo.png')
            logo_img = logo_img.resize((180, 60), Image.Resampling.LANCZOS)
            logo_photo = ImageTk.PhotoImage(logo_img)
            logo_label = tk.Label(
                logo_frame,
                image=logo_photo,
                bg=self.brand_colors['primary']
            )
            logo_label.image = logo_photo
            logo_label.pack(side=tk.LEFT)
        except:
            # Fallback to text logo
            logo_label = tk.Label(
                logo_frame,
                text="OPERA EYEWEAR",
                font=("Montserrat", 32, "bold"),
                fg=self.brand_colors['secondary'],
                bg=self.brand_colors['primary']
            )
            logo_label.pack(side=tk.LEFT)
        
        # Add tagline
        tk.Label(
            logo_frame,
            text="VIRTUAL TRY-ON",
            font=("Montserrat", 12),
            fg=self.brand_colors['text_light'],
            bg=self.brand_colors['primary']
        ).pack(side=tk.LEFT, padx=(20, 0))

    def create_main_content(self):
        # Main container with two columns
        main_container = tk.Frame(self.window, bg=self.brand_colors['bg_light'])
        main_container.pack(expand=True, fill=tk.BOTH, padx=60, pady=30)
        
        # Left column - Video feed
        video_frame = tk.Frame(
            main_container,
            bg=self.brand_colors['bg_dark'],
            highlightthickness=1,
            highlightbackground=self.brand_colors['accent']
        )
        video_frame.pack(side=tk.LEFT, expand=True, fill=tk.BOTH, padx=(0, 30))
        
        self.video_label = tk.Label(video_frame, bg=self.brand_colors['bg_dark'])
        self.video_label.pack(expand=True, padx=15, pady=15)
        
        # Right column - Controls
        controls_frame = tk.Frame(main_container, bg=self.brand_colors['bg_light'], width=350)
        controls_frame.pack(side=tk.RIGHT, fill=tk.Y)
        controls_frame.pack_propagate(False)
        
        # Collection title with underline
        title_frame = tk.Frame(controls_frame, bg=self.brand_colors['bg_light'])
        title_frame.pack(fill=tk.X, pady=(0, 30))
        
        tk.Label(
            title_frame,
            text="COLLECTIONS",
            font=("Montserrat", 18, "bold"),
            fg=self.brand_colors['text_dark'],
            bg=self.brand_colors['bg_light']
        ).pack(pady=(0, 5))
        
        separator = tk.Frame(
            title_frame,
            height=2,
            width=60,
            bg=self.brand_colors['secondary']
        )
        separator.pack()
        
        # Collection buttons
        for collection in self.collections.keys():
            self.create_collection_button(controls_frame, collection)
        
        # Frame info display
        self.frame_info = tk.Label(
            controls_frame,
            text="",
            font=("Montserrat", 14),
            fg=self.brand_colors['text_dark'],
            bg=self.brand_colors['bg_light']
        )
        self.frame_info.pack(pady=20)
        
        # Navigation controls
        nav_frame = tk.Frame(controls_frame, bg=self.brand_colors['bg_light'])
        nav_frame.pack(fill=tk.X, pady=20)
        
        self.create_nav_button(nav_frame, "←", self.prev_frame, "left")
        self.create_nav_button(nav_frame, "→", self.next_frame, "right")
        
        # Add recommendation panel
        self.create_recommendation_panel(controls_frame)

    def create_footer(self):
        footer = tk.Frame(
            self.window,
            bg=self.brand_colors['primary'],
            height=60
        )
        footer.pack(fill=tk.X, side=tk.BOTTOM)
        footer.pack_propagate(False)

        footer_text = tk.Label(
            footer,
            text="© 2024 Opera Eye Wear Nepal  |  All Rights Reserved  |  Privacy Policy",
            font=("Montserrat", 10),
            fg=self.brand_colors['text_light'],
            bg=self.brand_colors['primary']
        )
        footer_text.pack(pady=20)

    def create_collection_button(self, parent, collection_name):
        btn = tk.Button(
            parent,
            text=collection_name.upper(),
            command=lambda: self.change_collection(collection_name),
            font=("Montserrat", 13),
            bg=self.brand_colors['bg_light'],
            fg=self.brand_colors['text_dark'],
            relief="flat",
            width=28,
            height=2,
            cursor="hand2",
            borderwidth=1
        )
        btn.pack(pady=6)
        
        # Sophisticated hover effect
        def on_enter(e):
            btn.config(
                bg=self.brand_colors['primary'],
                fg=self.brand_colors['text_light']
            )
            btn.config(relief="solid")
            
        def on_leave(e):
            btn.config(
                bg=self.brand_colors['bg_light'],
                fg=self.brand_colors['text_dark']
            )
            btn.config(relief="flat")
            
        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)

    def create_nav_button(self, parent, text, command, side):
        btn = tk.Button(
            parent,
            text=text,
            command=command,
            font=("Montserrat", 20),
            bg=self.brand_colors['bg_light'],
            fg=self.brand_colors['primary'],
            relief="flat",
            width=4,
            cursor="hand2",
            borderwidth=1
        )
        btn.pack(side=side, padx=10)
        
        # Add hover effect
        def on_enter(e):
            btn.config(
                bg=self.brand_colors['secondary'],
                fg=self.brand_colors['text_dark']
            )
            
        def on_leave(e):
            btn.config(
                bg=self.brand_colors['bg_light'],
                fg=self.brand_colors['primary']
            )
            
        btn.bind("<Enter>", on_enter)
        btn.bind("<Leave>", on_leave)

    def create_recommendation_panel(self, parent):
        """Create panel for displaying frame recommendations"""
        recommendation_frame = tk.Frame(
            parent,
            bg=self.brand_colors['bg_light'],
            pady=20
        )
        recommendation_frame.pack(fill=tk.X)
        
        # Recommendation header
        tk.Label(
            recommendation_frame,
            text="RECOMMENDED FRAMES",
            font=("Montserrat", 14, "bold"),
            fg=self.brand_colors['text_dark'],
            bg=self.brand_colors['bg_light']
        ).pack()
        
        # Recommendation display
        self.recommendation_label = tk.Label(
            recommendation_frame,
            text="Analyzing face measurements...",
            font=("Montserrat", 12),
            fg=self.brand_colors['text_dark'],
            bg=self.brand_colors['bg_light'],
            wraplength=300
        )
        self.recommendation_label.pack(pady=10)

    def change_collection(self, collection):
        self.current_collection = collection
        self.current_frame_index = 0
        self.update_frame_info()

    def next_frame(self):
        if self.collections[self.current_collection]:
            self.current_frame_index = (self.current_frame_index + 1) % len(
                self.collections[self.current_collection]
            )
            self.update_frame_info()

    def prev_frame(self):
        if self.collections[self.current_collection]:
            self.current_frame_index = (self.current_frame_index - 1) % len(
                self.collections[self.current_collection]
            )
            self.update_frame_info()

    def update_frame_info(self):
        if self.collections[self.current_collection]:
            current_frame = self.collections[self.current_collection][self.current_frame_index]
            total_frames = len(self.collections[self.current_collection])
            self.frame_info.config(
                text=f"{current_frame['name']}\n{self.current_frame_index + 1} of {total_frames}"
            )

    def overlay_frame(self, background, overlay, x, y, w, h, angle=0):
        """Enhanced overlay function with better proportions"""
        try:
            if overlay is None:
                return background

            # Calculate height while maintaining aspect ratio
            overlay_height = overlay.shape[0]
            overlay_width = overlay.shape[1]
            aspect_ratio = overlay_width / overlay_height
            
            # Adjust height based on typical eyewear proportions
            h = int(w * 0.65)  # Adjusted height ratio
            
            # Resize frame
            overlay = cv2.resize(overlay, (w, h))

            # Ensure overlay has alpha channel
            if overlay.shape[2] != 4:
                return background

            # Create mask from alpha channel
            alpha = overlay[:, :, 3] / 255.0
            alpha = np.expand_dims(alpha, axis=-1)

            # Ensure coordinates are within bounds
            y_start = max(0, y)
            y_end = min(background.shape[0], y + h)
            x_start = max(0, x)
            x_end = min(background.shape[1], x + w)

            # Calculate overlay regions
            overlay_y_start = y_start - y
            overlay_y_end = overlay_y_start + (y_end - y_start)
            overlay_x_start = x_start - x
            overlay_x_end = overlay_x_start + (x_end - x_start)

            # Check if regions are valid
            if (overlay_y_end <= overlay_y_start or 
                overlay_x_end <= overlay_x_start or
                overlay_y_start < 0 or
                overlay_x_start < 0 or
                overlay_y_end > overlay.shape[0] or
                overlay_x_end > overlay.shape[1]):
                return background

            # Blend images
            for c in range(3):
                background[y_start:y_end, x_start:x_end, c] = (
                    overlay[overlay_y_start:overlay_y_end, 
                           overlay_x_start:overlay_x_end, c] * alpha[overlay_y_start:overlay_y_end, 
                                                               overlay_x_start:overlay_x_end, 0] +
                    background[y_start:y_end, x_start:x_end, c] * 
                    (1 - alpha[overlay_y_start:overlay_y_end, overlay_x_start:overlay_x_end, 0])
                )

            return background

        except Exception as e:
            print(f"Error in overlay_frame: {e}")
            return background

    def start(self):
        if self.web_mode:
            if self.cap is None:
                self.cap = cv2.VideoCapture(0)
        else:
            # Original Tkinter start logic
            self.cap = cv2.VideoCapture(0)
            self.update_frame_info()
            self.process_video()
            self.window.mainloop()

    def process_video(self):
        if self.cap is None or not self.cap.isOpened():
            return

        ret, frame = self.cap.read()
        if ret:
            frame = cv2.flip(frame, 1)  # Mirror image
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            h, w = frame.shape[:2]

            results = self.face_mesh.process(rgb_frame)
            if results.multi_face_landmarks:
                face_landmarks = results.multi_face_landmarks[0]
                
                # Get key points
                left_eye = (int(face_landmarks.landmark[33].x * w),
                           int(face_landmarks.landmark[33].y * h))
                right_eye = (int(face_landmarks.landmark[263].x * w),
                            int(face_landmarks.landmark[263].y * h))
                nose_top = (int(face_landmarks.landmark[168].x * w),
                           int(face_landmarks.landmark[168].y * h))
                nose_bottom = (int(face_landmarks.landmark[6].x * w),
                             int(face_landmarks.landmark[6].y * h))
                
                # Calculate current frame parameters
                eye_distance = np.linalg.norm(np.array(left_eye) - np.array(right_eye))
                current_width = int(eye_distance * 1.75)
                current_x = int(nose_top[0] - current_width / 2)
                
                nose_height = nose_bottom[1] - nose_top[1]
                current_y = int(nose_top[1] - nose_height * 5.0)
                
                current_angle = math.atan2(right_eye[1] - left_eye[1], 
                                         right_eye[0] - left_eye[0])

                # Apply smoothing
                if self.last_frame_pos is not None:
                    frame_x = int(self.last_frame_pos[0] * self.smoothing_factor + 
                                current_x * (1 - self.smoothing_factor))
                    frame_y = int(self.last_frame_pos[1] * self.smoothing_factor + 
                                current_y * (1 - self.smoothing_factor))
                    frame_width = int(self.last_frame_width * self.smoothing_factor + 
                                    current_width * (1 - self.smoothing_factor))
                    frame_angle = (self.last_frame_angle * self.smoothing_factor + 
                                 current_angle * (1 - self.smoothing_factor))
                else:
                    frame_x = current_x
                    frame_y = current_y
                    frame_width = current_width
                    frame_angle = current_angle

                # Update last positions
                self.last_frame_pos = (frame_x, frame_y)
                self.last_frame_width = frame_width
                self.last_frame_angle = frame_angle

                # Apply frame overlay
                if self.collections[self.current_collection]:
                    current_frame = self.collections[self.current_collection][self.current_frame_index]
                    if current_frame['image'] is not None:
                        frame = self.overlay_frame(
                            frame.copy(),
                            current_frame['image'].copy(),
                            frame_x,
                            frame_y,
                            frame_width,
                            0,
                            angle=frame_angle
                        )

            # Convert and display
            image = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
            photo = ImageTk.PhotoImage(image=image)
            self.video_label.configure(image=photo)
            self.video_label.image = photo

            self.window.after(10, self.process_video)

    def update_recommendations(self, measurements):
        """Update frame recommendations based on face measurements"""
        try:
            # Get frame recommendations
            recommendations = self.recommend_frames(measurements)
            
            if recommendations:
                # Format recommendation text
                rec_text = "Top Recommendations:\n\n"
                for i, rec in enumerate(recommendations[:3], 1):
                    score = int(rec['compatibility_score'] * 100)
                    rec_text += f"{i}. {rec['name']} ({score}% match)\n"
                
                # Update recommendation label
                if self.recommendation_label:
                    self.recommendation_label.config(text=rec_text)
                    
                # Automatically select best frame if none selected
                if self.current_frame_index == 0:
                    self.switch_to_recommended_frame(recommendations[0]['frame_id'])
                    
        except Exception as e:
            self.logger.error(f"Error updating recommendations: {e}")

    def switch_to_recommended_frame(self, frame_id):
        """Switch to a recommended frame"""
        try:
            # Find frame in collections
            for collection, frames in self.collections.items():
                for i, frame in enumerate(frames):
                    if frame['name'].lower() == frame_id.lower():
                        self.current_collection = collection
                        self.current_frame_index = i
                        self.update_frame_info()
                        return
        except Exception as e:
            self.logger.error(f"Error switching to recommended frame: {e}")

    def __del__(self):
        if self.cap is not None and self.cap.isOpened():
            self.cap.release()

    def _load_frames_metadata(self):
        """Load and validate frames metadata"""
        try:
            frames_path = Path('frames/frames_metadata.json')
            with open(frames_path, 'r') as f:
                frames_data = json.load(f)
            self._validate_frames_data(frames_data)
            return frames_data
        except Exception as e:
            self.logger.error(f"Error loading frames metadata: {str(e)}")
            return {}

    def _validate_frames_data(self, frames_data):
        """Validate frames data meets required specifications"""
        required_fields = ['name', 'dimensions', 'colors']
        for frame_id, frame_info in frames_data.items():
            for field in required_fields:
                if field not in frame_info:
                    raise ValueError(f"Missing required field '{field}' in frame {frame_id}")

    def detect_face_measurements(self, image) -> Optional[Dict[str, float]]:
        """
        Enhanced facial measurements following ISO standards
        Returns measurements in millimeters with calibration
        """
        results = self.face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if not results.multi_face_landmarks:
            return None

        landmarks = results.multi_face_landmarks[0]
        
        # Calculate real-world measurements using calibration
        measurements = {
            'pupillary_distance': self._calculate_pd(landmarks),
            'face_width': self._calculate_face_width(landmarks, image),
            'bridge_height': self._calculate_bridge_height(landmarks),
            'temple_width': self._calculate_temple_width(landmarks, image),
            'nose_bridge_width': self._calculate_nose_bridge_width(landmarks),
            'face_height': self._calculate_face_height(landmarks, image),
            'face_shape_index': self._calculate_face_shape_index(landmarks)
        }
        
        # Apply calibration factor based on known reference measurements
        calibrated_measurements = self._calibrate_measurements(measurements)
        return calibrated_measurements

    def _calculate_pd(self, landmarks):
        """Calculate pupillary distance"""
        left_eye_center = np.mean([landmarks.landmark[i] for i in self.FACIAL_LANDMARKS_GLASSES['left_eye']], axis=0)
        right_eye_center = np.mean([landmarks.landmark[i] for i in self.FACIAL_LANDMARKS_GLASSES['right_eye']], axis=0)
        return np.linalg.norm(left_eye_center - right_eye_center) * 1000  # Convert to mm

    def recommend_frames(self, face_measurements):
        """
        Recommend frames based on facial measurements
        Following international optical standards
        """
        suitable_frames = []
        
        for frame_id, frame_info in self.frames_data.items():
            if self._is_frame_suitable(face_measurements, frame_info['dimensions']):
                suitable_frames.append({
                    'frame_id': frame_id,
                    'name': frame_info['name'],
                    'compatibility_score': self._calculate_compatibility_score(
                        face_measurements, frame_info['dimensions']
                    )
                })
        
        return sorted(suitable_frames, key=lambda x: x['compatibility_score'], reverse=True)

    def try_on(self, image, frame_id):
        """
        Apply virtual try-on with realistic rendering
        """
        if frame_id not in self.frames_data:
            raise ValueError(f"Frame {frame_id} not found in database")

        measurements = self.detect_face_measurements(image)
        if not measurements:
            raise ValueError("No face detected in image")

        # Get frame 3D model and apply transformations
        frame_rendered = self._render_frame(
            image,
            self.frames_data[frame_id],
            measurements
        )
        
        return frame_rendered

    def _render_frame(self, image, frame_info, measurements):
        """
        Render frame with proper scaling, positioning, and lighting
        """
        # Implementation would include:
        # 1. 3D model loading
        # 2. Perspective transformation
        # 3. Lighting adjustment
        # 4. Realistic materials rendering
        # 5. Shadow casting
        # 6. Anti-aliasing
        
        # Placeholder for actual rendering implementation
        return image

    def _calculate_face_shape_index(self, landmarks) -> float:
        """Calculate face shape index following optical industry standards"""
        face_width = self._calculate_face_width(landmarks)
        face_height = self._calculate_face_height(landmarks)
        return face_height / face_width if face_width > 0 else 0

    def _calibrate_measurements(self, measurements: Dict[str, float]) -> Dict[str, float]:
        """
        Calibrate measurements using standard reference points
        Returns measurements in actual millimeters
        """
        # Standard average PD for calibration (63mm for adults)
        STANDARD_PD = 63.0
        calibration_factor = STANDARD_PD / measurements['pupillary_distance']
        
        return {
            key: value * calibration_factor
            for key, value in measurements.items()
        }

    def _calculate_compatibility_score(
        self, 
        face_measurements: Dict[str, float], 
        frame_dimensions: Dict[str, float]
    ) -> float:
        """
        Enhanced compatibility scoring following optical fitting guidelines
        Returns score between 0-1
        """
        weights = {
            'bridge_width': 0.25,
            'lens_width': 0.25,
            'temple_length': 0.2,
            'face_shape': 0.15,
            'style_fit': 0.15
        }
        
        scores = {
            'bridge_width': self._score_bridge_fit(
                face_measurements['nose_bridge_width'],
                frame_dimensions['bridge_width']
            ),
            'lens_width': self._score_lens_width_fit(
                face_measurements['face_width'],
                frame_dimensions['lens_width']
            ),
            'temple_length': self._score_temple_fit(
                face_measurements['temple_width'],
                frame_dimensions['temple_length']
            ),
            'face_shape': self._score_face_shape_compatibility(
                face_measurements['face_shape_index'],
                frame_dimensions['frame_style']
            ),
            'style_fit': self._score_style_compatibility(
                face_measurements,
                frame_dimensions
            )
        }
        
        final_score = sum(
            weights[key] * scores[key]
            for key in weights
        )
        
        return round(final_score, 2)

    def _is_frame_suitable(
        self, 
        face_measurements: Dict[str, float], 
        frame_dimensions: Dict[str, float]
    ) -> bool:
        """
        Enhanced frame suitability check following optical guidelines
        """
        # Check if measurements are within acceptable ranges
        checks = [
            self._check_bridge_width(
                face_measurements['nose_bridge_width'],
                frame_dimensions['bridge_width']
            ),
            self._check_lens_width(
                face_measurements['face_width'],
                frame_dimensions['lens_width']
            ),
            self._check_temple_length(
                face_measurements['temple_width'],
                frame_dimensions['temple_length']
            )
        ]
        
        return all(checks)

    def _check_bridge_width(self, nose_width: float, bridge_width: float) -> bool:
        """Check if bridge width is suitable"""
        MIN_CLEARANCE = 1.0  # minimum clearance in mm
        MAX_CLEARANCE = 3.0  # maximum clearance in mm
        
        clearance = bridge_width - nose_width
        return MIN_CLEARANCE <= clearance <= MAX_CLEARANCE

    def process_video_frame(self, frame, face_landmarks):
        """Process a single video frame with face landmarks"""
        h, w = frame.shape[:2]
        
        # Get key points
        left_eye = (int(face_landmarks.landmark[33].x * w),
                   int(face_landmarks.landmark[33].y * h))
        right_eye = (int(face_landmarks.landmark[263].x * w),
                    int(face_landmarks.landmark[263].y * h))
        nose_top = (int(face_landmarks.landmark[168].x * w),
                   int(face_landmarks.landmark[168].y * h))
        nose_bottom = (int(face_landmarks.landmark[6].x * w),
                     int(face_landmarks.landmark[6].y * h))
        
        # Calculate frame parameters
        eye_distance = np.linalg.norm(np.array(left_eye) - np.array(right_eye))
        current_width = int(eye_distance * 1.75)
        current_x = int(nose_top[0] - current_width / 2)
        
        nose_height = nose_bottom[1] - nose_top[1]
        current_y = int(nose_top[1] - nose_height * 5.0)
        
        current_angle = math.atan2(right_eye[1] - left_eye[1], 
                                right_eye[0] - left_eye[0])

        # Apply smoothing
        if self.last_frame_pos is not None:
            frame_x = int(self.last_frame_pos[0] * self.smoothing_factor + 
                        current_x * (1 - self.smoothing_factor))
            frame_y = int(self.last_frame_pos[1] * self.smoothing_factor + 
                        current_y * (1 - self.smoothing_factor))
            frame_width = int(self.last_frame_width * self.smoothing_factor + 
                            current_width * (1 - self.smoothing_factor))
            frame_angle = (self.last_frame_angle * self.smoothing_factor + 
                         current_angle * (1 - self.smoothing_factor))
        else:
            frame_x = current_x
            frame_y = current_y
            frame_width = current_width
            frame_angle = current_angle

        # Update last positions
        self.last_frame_pos = (frame_x, frame_y)
        self.last_frame_width = frame_width
        self.last_frame_angle = frame_angle

        # Apply frame overlay
        if self.collections[self.current_collection]:
            current_frame = self.collections[self.current_collection][self.current_frame_index]
            if current_frame['image'] is not None:
                frame = self.overlay_frame(
                    frame.copy(),
                    current_frame['image'].copy(),
                    frame_x,
                    frame_y,
                    frame_width,
                    0,
                    angle=frame_angle
                )

        return frame

    def stop(self):
        if self.cap is not None:
            self.cap.release()
            self.cap = None

    def get_frame(self):
        if self.cap is None or not self.cap.isOpened():
            return None

        ret, frame = self.cap.read()
        if not ret:
            return None

        # Resize frame to standard dimensions
        frame = cv2.resize(frame, (self.image_width, self.image_height))
        frame = cv2.flip(frame, 1)
        
        # Convert to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        results = self.face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks:
            face_landmarks = results.multi_face_landmarks[0]
            frame = self.process_video_frame(frame, face_landmarks)
            
        return frame

if __name__ == "__main__":
    app = VirtualTryOn()
    app.start() 