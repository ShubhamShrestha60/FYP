# Use Debian-based Node image for smoother npm installs
FROM node:18-bullseye

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Expose backend port
EXPOSE 5001

# Start the server
CMD ["npm", "start"]

