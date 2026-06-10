const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");
const tripRoutes = require("./routes/tripRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from the frontend.
app.use(cors());

// Parse JSON request bodies.
app.use(express.json());

// Health check endpoint.
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Travel Planner API is running",
    database: "connected",
  });
});

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