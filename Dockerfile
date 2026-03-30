# Stage 1: Build the React Application
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Prepare the Node.js API Environment
FROM node:18-alpine
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --production

# Stage 3: Merge the Application
COPY backend/ ./

# Port the built frontend into our Node.js runtime folder (two levels up from server.js execution)
# so the `express.static("../frontend/build")` works!
COPY --from=frontend-build /app/frontend/build /app/frontend/build

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
