import mongoose from "mongoose";
const { Schema } = mongoose;

const facultySchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  faculty_code: { type: String, required: true },
  faculty_name: { type: String, required: true },
  max_hours_per_week: { type: Number, default: 18 },
  unavailable_slots: [{
    day: { type: String, enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] },
    slot_index: Number
  }]
}, { timestamps: true });

facultySchema.index({ institute: 1, faculty_code: 1 }, { unique: true });

export default mongoose.models.Faculty || mongoose.model("Faculty", facultySchema);