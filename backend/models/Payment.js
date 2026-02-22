  import mongoose from "mongoose";

  const paymentSchema = new mongoose.Schema({
    institute: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    order_id: { type: String, required: true, unique: true },
    cf_order_id: { type: String }, // Cashfree's internal ID
    amount: { type: Number, required: true },
    status: { type: String, enum: ["CREATED", "SUCCESS", "FAILED"], default: "CREATED" },
    payment_session_id: { type: String } // Needed for Frontend SDK
  }, { timestamps: true });

  export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema); 