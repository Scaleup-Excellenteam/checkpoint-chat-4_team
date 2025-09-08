const Room = require("../models/Room");
const { hasLeak } = require("../utils/dlpChecker");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log(`✅ ${socket.user.name} connected (id: ${socket.id})`);

    socket.on("joinRoom", async (roomId) => {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit("errorMessage", "Room not found");
        return;
      }

      if (!room.users.map(u => u.toString()).includes(socket.user.id)) {
        room.users.push(socket.user.id);
        await room.save();
      }

      socket.join(roomId);
      console.log(`${socket.user.name} joined room ${room.name}`);
      io.to(roomId).emit("systemMessage", `${socket.user.name} joined the room`);
    });

    socket.on("chatMessage", async ({ roomId, message }) => {
      // check for secret recipes data leak
      const leaking = await hasLeak(message);
      if (leaking) {
        socket.emit("systemMessage", "Message contains restricted content");
        return;
      }
      console.log(`[${roomId}] ${socket.user.name}: ${message}`);
      io.to(roomId).emit("chatMessage", {
        sender: socket.user.name,
        text: message,
      });
    });

    socket.on("disconnect", async () => {
      console.log(`❌ ${socket.user.name} disconnected`);
      try {
        await Room.updateMany(
          { users: socket.user.id },
          { $pull: { users: socket.user.id } }
        );
        socket.rooms.forEach(roomId => {
          if (roomId !== socket.id) {
            io.to(roomId).emit("systemMessage", `${socket.user.name} left the room`);
          }
        });
      } catch (err) {
        console.error("Error removing user from rooms:", err);
      }
    });
  });
};
