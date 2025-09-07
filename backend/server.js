// server.js
const express = require("express");
const app = express();
const PORT = 3000;
const authRoutes = require("./routes/authRoutes");

// Middleware for JSON parsing
app.use(express.json());

// Use auth routes
app.use("/auth", authRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
