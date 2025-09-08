const Room = require("../models/Room");
const { hasLeak } = require("../utils/dlpChecker");
const { checkMessageUrls } = require("../utils/urlChecker");

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

      // check for malicious URLs
      const urlScan = await checkMessageUrls(message);
      // find the highest score across all URLs
      const maxScore = urlScan.reduce((acc, r) => Math.max(acc, r.score), 0);
      if (maxScore >= 70) {
        console.log(":rotating_light: Message blocked (score >= 70)");
        io.to(roomId).emit(
          "systemMessage",
          `:warning: ${socket.user.name} tried to share a dangerous link (risk score ${maxScore}). Message blocked.`
        );
        return;
      }

      // check for secret recipes data leak
      const leaking = await hasLeak(message);
      if (leaking) {
        socket.emit("systemMessage", "Message contains restricted content");
        return;
      }

      // Broadcast the message to the room
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
