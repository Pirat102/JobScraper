FROM node:20-slim

WORKDIR /app

# Add any necessary system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose development port
EXPOSE 5173

# Command to run the development server
CMD ["npm", "run", "dev", "--", "--host"]