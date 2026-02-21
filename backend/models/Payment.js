import mongoose from "mongoose";
const { Schema } = mongoose;

const paymentSchema = new Schema({
  institute: {
    type: Schema.ObjectId,
    ref: "Institute",
    required: true
  },

  subscription: {
    type: Schema.ObjectId,
    ref: "Subscription"
  },

  order_id: { type: String, required: true },
  payment_id: { type: String },

  amount: { type: Number, required: true },

  currency: { type: String, default: "INR" },

  status: {
    type: String,
    enum: ["CREATED", "SUCCESS", "FAILED"],
    default: "CREATED"
  },

  payment_gateway: {
    type: String,
    default: "CASHFREE"
  }

}, { timestamps: true });

paymentSchema.index({ order_id: 1 }, { unique: true });

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);