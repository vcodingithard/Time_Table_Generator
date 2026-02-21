import Room from "../models/Room.js";

export const roomService = {
  createRoom: async (instituteId, data) => {
    const { room_no } = data;

    const exists = await Room.findOne({ institute: instituteId, room_no });
    if (exists) throw new Error("Room number already exists in your institute");

    return await Room.create({
      ...data,
      institute: instituteId
    });
  },

  getAllRooms: async (instituteId) => {
    return await Room.find({ institute: instituteId })
      .sort({ room_type: 1, room_no: 1 });
  },

  getRoomById: async (instituteId, roomId) => {
    const room = await Room.findOne({ _id: roomId, institute: instituteId });
    if (!room) throw new Error("Room not found");
    return room;
  },

  updateRoom: async (instituteId, roomId, updateData) => {
    const updated = await Room.findOneAndUpdate(
      { _id: roomId, institute: instituteId },
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updated) throw new Error("Room not found or unauthorized");
    return updated;
  },

  deleteRoom: async (instituteId, roomId) => {
    const deleted = await Room.findOneAndDelete({ _id: roomId, institute: instituteId });
    if (!deleted) throw new Error("Room not found");
    return { message: "Room deleted successfully" };
  }
};