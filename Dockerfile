FROM node:20-alpine

# Install OS-level dependencies for canvas/ffmpeg if needed by fluent-ffmpeg under the hood
RUN apk add --no-cache ffmpeg

WORKDIR /app

# Copy package info and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the project
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
