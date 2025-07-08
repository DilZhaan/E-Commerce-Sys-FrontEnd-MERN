FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy rest of the code
COPY . .

# Build the React app
RUN npm run build

# Production image
FROM node:18-alpine

# Install serve
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy build files from builder stage
COPY --from=builder /app/build ./build

# Switch to non-root user
USER node

# Expose frontend port
EXPOSE 3000

# Serve the build folder
CMD ["serve", "-s", "build", "-l", "3000"]