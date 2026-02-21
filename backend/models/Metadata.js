import mongoose from "mongoose";
const { Schema } = mongoose;

const metadataSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  classId: { type: Schema.ObjectId, ref: "Class", required: true }, // Linked to class
  total_days: { type: Number, default: 6 },
  slots_per_day: { type: Number, required: true },
  slot_times: [{ 
    start_time: String, 
    end_time: String,
    label: String // e.g., "Morning Session"
  }],
  breaks: {
    tea_break: { start_time: String, end_time: String },
    lunch_break: { start_time: String, end_time: String }
  }
}, { timestamps: true });

metadataSchema.index({ institute: 1, classId: 1 }, { unique: true });

export default mongoose.models.Metadata || mongoose.model("Metadata", metadataSchema);