FROM node:18

# Set the working directory
WORKDIR /app

# Install system dependencies first (build tools)
RUN apt-get update && \
    apt-get install -y python3 make g++ build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy only package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Update npm to a specific version and install node modules
RUN npm install -g npm@10.9.0 && npm install

# Copy the rest of your application code
COPY . .

# Build the Strapi app (adjust if your app doesn't use this)
RUN npm run build

# Expose Strapi default port
EXPOSE 1337

# Start the Strapi server
CMD ["npm", "run", "start"]
