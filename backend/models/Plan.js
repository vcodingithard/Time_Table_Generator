import mongoose from "mongoose";
const { Schema } = mongoose;

const planSchema = new Schema({
  name: { type: String, enum: ["FREE", "CREDIT_PACK", "PRO"], required: true },
  price: { type: Number, required: true },
  call_limit: { type: Number, default: 0 },
  validity_days: { type: Number }
}, { timestamps: true });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);