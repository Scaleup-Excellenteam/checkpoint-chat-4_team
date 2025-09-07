// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const roomsRouter = require("./routes/roomsRouter");
const chatSocket = require("./sockets/chatSocket");
const connectDB = require("./db");
const cors = require("cors");
const Room = require("./models/Room");
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
app.use(cors());

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
io.on("connection", (socket) => {
  console.log(`✅ ${socket.user.name} connected (id: ${socket.id})`);

  // Join room
  socket.on("joinRoom", async (roomId) => {
    const room = await Room.findById(roomId);
    if (!room) {
      socket.emit("errorMessage", "Room not found");
      return;
    }

    // Add user to room in DB if not already in it
    if (!room.users.map(u => u.toString()).includes(socket.user.id)) {
      room.users.push(socket.user.id);
      await room.save();
    }

    // Add socket to Socket.IO room
    socket.join(roomId);
    console.log(`${socket.user.name} joined room ${room.name}`);

    io.to(roomId).emit("systemMessage", `${socket.user.name} joined the room`);
  });

  // Send message
  socket.on("chatMessage", ({ roomId, message }) => {
    console.log(`[${roomId}] ${socket.user.name}: ${message}`);
    io.to(roomId).emit("chatMessage", {
      sender: socket.user.name,
      text: message,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${socket.user.name} disconnected`);
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
