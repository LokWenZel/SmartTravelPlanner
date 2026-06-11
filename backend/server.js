const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDatabase = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow Postman, mobile apps, server-to-server requests, and same-origin requests.
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS."));
  },
  credentials: true,
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

// Add secure HTTP response headers.
app.use(helmet());

// Allow only approved frontend origins.
app.use(cors(corsOptions));

// Limit repeated requests from the same IP address.
app.use(generalLimiter);

// Parse JSON request bodies with a size limit.
app.use(express.json({ limit: "10kb" }));

// Health check endpoint.
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Travel Planner API is running",
    database: "connected",
  });
});

// Auth API routes have stricter rate limiting.
app.use("/api/v1/auth", authLimiter, authRoutes);

// Trip API routes.
app.use("/api/v1/trips", tripRoutes);

// These must be placed after all valid routes.
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();