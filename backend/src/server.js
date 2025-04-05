const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const habitsRoutes = require("./routes/habitsRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/habits", habitsRoutes);
app.use("/api/ai", aiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    // Start server after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Handle unexpected errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

module.exports = app;
