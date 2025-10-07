# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 9001
EXPOSE 9001

# Set environment variable for port
ENV PORT=9001

# Start the application
CMD ["npm", "start"]


