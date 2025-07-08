FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the code
COPY . .

# Set environment variables with defaults
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://localhost:5000

# Start the development server (for testing)
EXPOSE 3000
CMD ["npm", "start"]