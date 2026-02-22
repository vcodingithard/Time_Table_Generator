import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";

// Change this line in your service file
const CF_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

const getHeaders = () => ({
  "x-client-id": process.env.CF_APP_ID?.trim(),
  "x-client-secret": process.env.CF_SECRET_KEY?.trim(),
  "x-api-version": "2023-08-01",
  "Content-Type": "application/json"
});
export const paymentService = {
  // 1️⃣ CREATE ORDER (Updated with Detailed Error Handling)
  async createOrder(instituteId, planId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const plan = await Plan.findById(planId).session(session);
      if (!plan) throw new Error("Plan not found");
      console.log("node env", process.env.NODE_ENV)
      const Institute = mongoose.model("Institute");
      const institute = await Institute.findById(instituteId).session(session);
      if (!institute) throw new Error("Institute not found");

      const orderId = `ORD_${Date.now()}_${instituteId.toString().slice(-4)}`;

   const payload = {
  order_id: orderId,
  order_amount: Number(plan.price),
  order_currency: "INR",
  customer_details: {
    customer_id: instituteId.toString(),
    customer_email: institute.email || "admin@institute.com",
    customer_phone: (institute.phone || "9999999999").replace(/\D/g, '').slice(-10)
  },
  order_meta: {
    return_url: `${process.env.FRONTEND_URL}/payment-status?order_id=${orderId}`,
    // ADD THIS LINE BELOW
    notify_url: process.env.CASHFREE_NOTIFY_URL
  }
};

      const response = await axios.post(
        `${CF_BASE_URL}/orders`,
        payload,
        { headers: getHeaders() } // Call the function here
      );

      const payment = await Payment.create([{
        institute: instituteId,
        planId,
        order_id: orderId,
        cf_order_id: response.data.cf_order_id,
        amount: plan.price,
        payment_session_id: response.data.payment_session_id,
        status: "CREATED"
      }], { session });

      await session.commitTransaction();
      session.endSession();

      return payment[0];

    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      // --- LOGGING THE ACTUAL CASHFREE ERROR ---
      if (err.response) {
        console.error("❌ Cashfree API Error:", {
          status: err.response.status,
          data: err.response.data, // This contains the 'message' and 'code' from Cashfree
        });

        // Throw a cleaner error for your controller
        const cfError = new Error(err.response.data.message || "Cashfree Authentication Failed");
        cfError.status = err.response.status;
        throw cfError;
      }

      throw err;
    }
  },

  // 2️⃣ VERIFY WEBHOOK SIGNATURE
verifyWebhook(rawBody, signature, timestamp) {
  const secretKey = process.env.CF_SECRET_KEY?.trim();
  
  // The magic formula for v3: concat timestamp and rawBody
  const dataToVerify = timestamp + rawBody;

  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(dataToVerify)
    .digest("base64");

  console.log("--- Signature Debug ---");
  console.log("Received Signature:", signature);
  console.log("Calculated Expected:", expected);
  
  return expected === signature;
},
 async processWebhook(event) {
    console.log("🔔 Webhook Received Event Type:", event.type);
    
    // 1. Updated filter to accept both standard and success webhook types
    const successEvents = ["ORDER_PAID", "PAYMENT_SUCCESS_WEBHOOK"];
    
    if (!successEvents.includes(event.type)) {
      console.log(`ℹ️ Ignoring event type: ${event.type}`);
      return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Cashfree structure can vary slightly between event types, 
      // but data.order.order_id is the standard for both.
      const orderId = event.data.order.order_id;
      
      console.log(`📦 Processing Success Webhook for Order: ${orderId}`);

      // 2. Find existing payment record
      const payment = await Payment.findOne({ order_id: orderId }).session(session);
      if (!payment) {
        console.error("❌ Payment record not found in DB for order:", orderId);
        await session.abortTransaction();
        return;
      }

      // 3. Idempotency Check
      if (payment.status === "SUCCESS") {
        console.log("⚠️ Payment already processed as SUCCESS. Skipping.");
        await session.abortTransaction();
        return;
      }

      // 4. Get Plan Details
      const plan = await Plan.findById(payment.planId).session(session);
      if (!plan) throw new Error("Plan not found for this payment");

      // 5. Subscription Extension Logic
      const existingSub = await Subscription.findOne({ 
        institute: payment.institute 
      }).session(session);

      const now = new Date();
      let baseDate = now;

      if (existingSub && existingSub.expiry_date > now) {
        baseDate = existingSub.expiry_date;
      }

      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + (plan.validity_days || 30));

      // 6. Update Payment Record
      payment.status = "SUCCESS";
      // We use payment.paid_at to track when the money actually hit
      payment.paid_at = now; 
      await payment.save({ session });

      // 7. Upsert Subscription Record
      // We reset calls_used to 0 because they just paid for a new cycle
      await Subscription.findOneAndUpdate(
        { institute: payment.institute },
        {
          plan: payment.planId,
          status: "ACTIVE",
          expiry_date: newExpiry,
          calls_used: 0 
        },
        { upsert: true, new: true, session }
      );

      await session.commitTransaction();
      console.log(`✅ SUCCESS: Subscription updated for ${payment.institute}. New Expiry: ${newExpiry.toDateString()}`);

    } catch (err) {
      await session.abortTransaction();
      console.error("❌ Webhook Database Error:", err.message);
      throw err;
    } finally {
      session.endSession();
    }
  },
  // 5️⃣ STATUS CHECK (ONLY READ DB)
  async getPaymentStatus(orderId) {
    const payment = await Payment.findOne({ order_id: orderId });

    if (!payment) throw new Error("Order not found");

    return payment.status;
  },

  async getAllPlans() {
    return Plan.find({}).sort({ price: 1 });
  },

  async getSubscriptionByInstitute(instituteId) {
    return Subscription.findOne({ institute: instituteId })
      .populate("plan")
      .lean();
  }
};