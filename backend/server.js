// server.js
const express = require("express");
const app = express();
const PORT = 3000;
const authRoutes = require("./routes/authRoutes");
const roomsRouter = require("./routes/roomsRouter");
const connectDB = require("./db");
const cors = require("cors");

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors());

// Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomsRouter);

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
