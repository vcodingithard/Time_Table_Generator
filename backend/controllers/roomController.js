import { roomService } from "../services/roomService.js";

export const createRoom = async (req, res) => {
  try {
    const data = await roomService.createRoom(req.user._id, req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getRooms = async (req, res) => {
  try {
    const data = await roomService.getAllRooms(req.user._id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const data = await roomService.getRoomById(req.user._id, req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const data = await roomService.updateRoom(req.user._id, req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const result = await roomService.deleteRoom(req.user._id, req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};