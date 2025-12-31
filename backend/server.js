import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import compression from "compression";
import channelRoutes from "./routes/channelRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow all origins for Vercel deployment
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://yo-tv.vercel.app',
      'https://yo-tv-pjud.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(compression()); // Enable gzip compression
app.use(express.json({ limit: "10mb" }));

// Disable x-powered-by header for security
app.disable("x-powered-by");

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Routes
app.use("/api/channels", channelRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Yo TV API is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
