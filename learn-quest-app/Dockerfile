# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory in the container
WORKDIR /app

# Copy package files to leverage Docker cache for dependencies installation
COPY package*.json ./

# Install Angular CLI globally (if not already part of your dependencies) and local dependencies
RUN npm install -g @angular/cli && npm install

# Copy the rest of the application code
COPY . .

# Expose the port the Angular dev server runs on
EXPOSE 4200

# Start the Angular development server
CMD ["ng", "serve", "--host", "0.0.0.0"]
