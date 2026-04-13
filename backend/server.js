import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import compression from "compression";
import helmet from "helmet";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/auth.js";
import confessionRoutes from "./routes/confession.js";

dotenv.config();

const app = express();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined in environment variables!");
  // We don't exit(1) immediately to allow the server to start and return 500 errors instead of connection refused
}

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ limit: "16mb", extended: true }));
app.use(cors());

// Disable buffering to fail fast if DB is down
mongoose.set("bufferCommands", false);

if (MONGO_URI) {
  mongoose.connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("Mongoose connection error:", err.message));
}

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/confessions", confessionRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    env: process.env.NODE_ENV 
  });
});

if (process.env.NODE_ENV === "production" && fs.existsSync(path.join(__dirname, "../frontend/build"))) {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API Running (Note: Frontend build not found or not in production mode)");
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});