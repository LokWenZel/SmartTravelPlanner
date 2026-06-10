const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// This one is to allows requests from the React frontend
app.use(cors());

// This converts incoming JSON request bodies into JavaScript objects
app.use(express.json());

// We set a temporary test route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Travel Planner API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});