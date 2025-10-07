# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 9000
EXPOSE 9000

# Set environment variable for port
ENV PORT=9000

# Start the application
CMD ["npm", "start"]


