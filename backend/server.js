// server.js
const express = require("express");
const app = express();
const PORT = 3000;
const authRoutes = require("./routes/authRoutes");
const roomsRouter = require("./routes/roomsRouter");
const connectDB = require("./db");

// Middleware
app.use(express.json());

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
