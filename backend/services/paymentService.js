import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";

const CF_BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://api.cashfree.com/pg" 
  : "https://sandbox.cashfree.com/pg";

export const paymentService = {
  createOrder: async (instituteId, planId) => {
    console.log("Service: Creating Cashfree Order...");

    const plan = await Plan.findById(planId);
    if (!plan) throw new Error("Plan not found in Database");

    const Institute = mongoose.model("Institute");
    const institute = await Institute.findById(instituteId);
    if (!institute) throw new Error("Institute not found in Database");

    const orderId = `ORD_${Date.now()}_${instituteId.toString().slice(-4)}`;

    const payload = {
      order_amount: plan.price,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: instituteId.toString(),
        customer_phone: institute.phone || "9999999999",
        customer_email: institute.email
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`
      }
    };

    console.log("Sending Payload to Cashfree:", JSON.stringify(payload, null, 2));

    const response = await axios.post(`${CF_BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": process.env.CF_APP_ID,
        "x-client-secret": process.env.CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    console.log("Cashfree API Response:", response.data);

    return await Payment.create({
      institute: instituteId,
      planId: planId,
      order_id: orderId,
      cf_order_id: response.data.cf_order_id,
      amount: plan.price,
      payment_session_id: response.data.payment_session_id
    });
  },

  checkPaymentStatus: async (orderId) => {
    console.log(`Service: Fetching Status for ${orderId} from Cashfree`);
    
    const response = await axios.get(`${CF_BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": process.env.CF_APP_ID,
        "x-client-secret": process.env.CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    console.log(`Cashfree Status Response for ${orderId}:`, response.data.order_status);

    if (response.data.order_status === "PAID") {
      console.log("Order is PAID. Calling fulfillment...");
      await paymentService.fulfillSubscription(orderId);
    }

    return response.data;
  },

  fulfillSubscription: async (orderId) => {
    console.log(`--- TRANSACTION START: Fulfilling ${orderId} ---`);
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ order_id: orderId }).session(session);
      
      if (!payment) {
        console.error("Fulfillment Error: Payment record not found in DB");
        await session.abortTransaction();
        return;
      }
      
      if (payment.status === "SUCCESS") {
        console.log("Fulfillment Skip: Already processed (Idempotency)");
        await session.abortTransaction();
        return;
      }

      const plan = await Plan.findById(payment.planId).session(session);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (plan.validity_days || 30));

      payment.status = "SUCCESS";
      await payment.save({ session });
      console.log("Payment record marked as SUCCESS");

      const sub = await Subscription.findOneAndUpdate(
        { institute: payment.institute },
        {
          plan: payment.planId,
          status: "ACTIVE",
          expiry_date: expiryDate,
          calls_used: 0
        },
        { upsert: true, session, new: true }
      );
      
      console.log("Subscription Document Updated:", sub._id);

      await session.commitTransaction();
      console.log(`--- TRANSACTION COMMITTED: ${orderId} is now active ---`);
    } catch (error) {
      console.error("FULFILLMENT TRANSACTION FAILED:", error.message);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
  getAllPlans: async () => {
    // We sort by price so they appear in order (FREE -> PRO -> ENTERPRISE)
    return await Plan.find({}).sort({ price: 1 });
  },

  /**
   * GET CURRENT SUBSCRIPTION: To show usage on the dashboard
   */
  getSubscriptionByInstitute: async (instituteId) => {
    return await Subscription.findOne({ institute: instituteId })
      .populate("plan")
      .lean();
  },
};