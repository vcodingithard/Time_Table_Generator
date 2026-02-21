import mongoose from "mongoose";
const { Schema } = mongoose;

const courseSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  course_code: { type: String, required: true },
  course_name: { type: String, required: true },
  course_type: { type: String, enum: ["THEORY", "LAB", "ELECTIVE"], required: true },
  hours_per_week: { type: Number, required: true },
  
  // Logic for the generator
  consecutive_slots: { type: Number, default: 1 }, // Labs might need 3
  requires_lab: { type: Boolean, default: false },

  classIds: [{ type: Schema.ObjectId, ref: "Class" }],
  teachers_assigned: [{ type: Schema.ObjectId, ref: "Faculty" }],
}, { timestamps: true });

courseSchema.index({ institute: 1, course_code: 1 }, { unique: true });

export default mongoose.models.Course || mongoose.model("Course", courseSchema);