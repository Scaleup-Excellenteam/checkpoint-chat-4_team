const express = require("express");
const router = express.Router();
const roomsController = require("../controllers/roomsController");
const verifyJWT = require("../middlewares/authMiddleware");

// Routes
router.get("/", verifyJWT, roomsController.getAllRooms); // get all rooms
router.post("/add", verifyJWT, roomsController.addRoom); // add new room (newRoomName)
router.delete("/:id",verifyJWT, roomsController.deleteRoom); // delete room (roomID)

module.exports = router;
