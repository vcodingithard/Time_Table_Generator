import mongoose from "mongoose";
const { Schema } = mongoose;

const sessionSchema = new Schema({
  course: { type: Schema.ObjectId, ref: "Course" },
  faculty: { type: Schema.ObjectId, ref: "Faculty" },
  room: { type: Schema.ObjectId, ref: "Room" },
  slot_index: { type: Number }, // Refers to the index in slot_times
  activity: { type: String, enum: ["LECTURE", "LAB", "SEMINAR", "OFFLINE"], default: "LECTURE" }
}, { _id: false });

const daySchema = { type: [sessionSchema], default: [] };

const classTimetableSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  classId: { type: Schema.ObjectId, ref: "Class", required: true },
  
  // Basic info stored for quick display without heavy population
  display_info: {
    semester: Number,
    section: String,
    department: String,
    effective_from: Date
  },

  timetable: {
    MONDAY: daySchema,
    TUESDAY: daySchema,
    WEDNESDAY: daySchema,
    THURSDAY: daySchema,
    FRIDAY: daySchema,
    SATURDAY: daySchema
  },

  // Store faculty references here too for easy "Find all timetables for Prof. X"
  faculty_involved: [{ type: Schema.ObjectId, ref: "Faculty" }]
}, { timestamps: true });

// Ensures one timetable per class
classTimetableSchema.index({ institute: 1, classId: 1 }, { unique: true });

// Optional: Index for searching by semester/section quickly
classTimetableSchema.index({ "display_info.semester": 1, "display_info.section": 1 });

export default mongoose.models.Timetable || mongoose.model("Timetable", classTimetableSchema);