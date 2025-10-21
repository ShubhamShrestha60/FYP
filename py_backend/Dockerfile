# Use Python base image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install OpenCV dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency file and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files
COPY . .

# Expose the WebSocket port
EXPOSE 8000

# Start the server
CMD ["python", "server.py"]

