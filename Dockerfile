# Build frontend
FROM node:18.17-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Show more detailed npm logs
ENV NPM_CONFIG_LOGLEVEL=verbose
RUN npm install --no-package-lock --legacy-peer-deps

# Copy frontend files
COPY frontend/ .

# Update vite config for production
RUN echo 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react"; export default defineConfig({ plugins: [react()], build: { outDir: "dist", emptyOutDir: true, sourcemap: true }, });' > vite.config.js

# Build with detailed logs
RUN npm run build || (echo "Build failed. Showing node_modules:" && ls -la node_modules && echo "Showing src:" && ls -la src && exit 1)

# Build and run all services
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install nginx
RUN apt-get update && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Setup Python backend
COPY py_backend/requirements.txt /app/python/
WORKDIR /app/python
RUN pip install --no-cache-dir -r requirements.txt
COPY py_backend/ .

# Setup Node backend
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --no-package-lock --legacy-peer-deps
COPY server/ .

# Copy built frontend and nginx config
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy start script
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

EXPOSE ${PORT}

CMD ["./start.sh"] 