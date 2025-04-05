# Use the official Node.js Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package files to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app into the container
COPY . .

# Expose React dev server port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
