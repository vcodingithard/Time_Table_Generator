import mongoose from "mongoose";
const { Schema } = mongoose;

const roomSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  room_no: { type: String, required: true },
  capacity: Number,
  room_type: { 
    type: String,
    enum: ["CLASSROOM", "LAB"],
    default: "CLASSROOM" 
  }
}, { timestamps: true });

roomSchema.index({ institute: 1, room_no: 1 }, { unique: true });

export default mongoose.models.Room || mongoose.model("Room", roomSchema);