const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// It will allow the React frontend to call this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// API versioning helps future changes remain organized
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Travel Planner API is running",
    database: "connected",
  });
});

/**
 * Gotta make sure we connect to MongoDB before accepting HTTP requests
 */
const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();