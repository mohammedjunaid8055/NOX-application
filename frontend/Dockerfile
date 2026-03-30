# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build for production
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy built assets from the previous stage to Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
