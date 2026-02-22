import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true, unique: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan", required: true },
  calls_used: { type: Number, default: 0 },
  status: { type: String, enum: ["ACTIVE", "EXPIRED", "CANCELLED"], default: "ACTIVE" },
  expiry_date: { type: Date }
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);