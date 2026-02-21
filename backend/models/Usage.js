import mongoose from "mongoose";
const { Schema } = mongoose;

const usageSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true },
  action_type: { type: String, default: "TIMETABLE_GENERATION" },
  status: String
}, { timestamps: true });

export default mongoose.models.Usage || mongoose.model("Usage", usageSchema);