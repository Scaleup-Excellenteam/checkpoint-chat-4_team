// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const roomsRouter = require("./routes/roomsRouter");
const chatSocket = require("./sockets/chatSocket");
const connectDB = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const PORT = 3000;


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(express.json());

// CORS configuration
app.use(cors({
  origin: "*",
}));

// Routes
app.use("/auth", authRoutes);
app.use("/rooms", roomsRouter);

// --- Authenticate sockets ---
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    socket.user = decoded; // attach user to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// --- Handle socket connections ---
chatSocket(io);

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
