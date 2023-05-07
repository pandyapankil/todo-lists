# Use Node.js v14 as the base image
FROM node:17

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the port the app is running on
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
