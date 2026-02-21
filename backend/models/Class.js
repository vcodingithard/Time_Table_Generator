import mongoose from "mongoose";
const { Schema } = mongoose;

const classSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  semester: { type: Number, required: true },
  section: { type: String, required: true },
  room: { type: Schema.ObjectId, ref: "Room" }, // Default room
  coordinator: { type: Schema.ObjectId, ref: "Faculty" },
}, { timestamps: true });

classSchema.index({ institute: 1, semester: 1, section: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model("Class", classSchema);