import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, enum: ["FREE", "PRO", "ENTERPRISE"], required: true },
  price: { type: Number, required: true },
  call_limit: { type: Number, default: 0 },
  validity_days: { type: Number, default: 30 }
}, { timestamps: true });

export default mongoose.models.Plan || mongoose.model("Plan", planSchema);