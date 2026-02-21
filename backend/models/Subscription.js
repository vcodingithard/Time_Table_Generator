import mongoose from "mongoose";
const { Schema } = mongoose;

const subscriptionSchema = new Schema({
  institute: { type: Schema.ObjectId, ref: "Institute", required: true, unique: true },
  plan: { type: Schema.ObjectId, ref: "Plan", required: true },
  calls_used: { type: Number, default: 0 },
  status: { type: String, enum: ["ACTIVE", "EXPIRED", "CANCELLED"], default: "ACTIVE" }
}, { timestamps: true });

subscriptionSchema.index({ institute: 1 }, { unique: true });

export default mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);