# Build frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build and run all services
FROM python:3.9-slim
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y \
    curl \
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
RUN npm install
COPY server/ .

# Copy built frontend and nginx config
COPY --from=frontend-build /app/frontend/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy start script
WORKDIR /app
COPY start.sh .
RUN chmod +x start.sh

EXPOSE ${PORT}

CMD ["./start.sh"] 