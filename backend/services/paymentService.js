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
  /**
   * CREATE ORDER: Initiates the process with Cashfree
   */
  createOrder: async (instituteId, planId, customerDetails) => {
    const plan = await Plan.findById(planId);
    if (!plan) throw new Error("Plan not found");

    const orderId = `ORD_${Date.now()}_${instituteId.toString().slice(-4)}`;

    const payload = {
      order_amount: plan.price,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: instituteId.toString(),
        customer_phone: customerDetails.phone,
        customer_email: customerDetails.email
      },
      order_meta: {
        // Redirection URL after payment completion
        return_url: `${process.env.FRONTEND_URL}/payment-status?order_id={order_id}`
      }
    };

    const response = await axios.post(`${CF_BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": process.env.CF_APP_ID,
        "x-client-secret": process.env.CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    return await Payment.create({
      institute: instituteId,
      planId: planId,
      order_id: orderId,
      cf_order_id: response.data.cf_order_id,
      amount: plan.price,
      payment_session_id: response.data.payment_session_id
    });
  },

  /**
   * VERIFY STATUS: Direct API check for immediate feedback
   */
  checkPaymentStatus: async (orderId) => {
    const response = await axios.get(`${CF_BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": process.env.CF_APP_ID,
        "x-client-secret": process.env.CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    if (response.data.order_status === "PAID") {
      await paymentService.fulfillSubscription(orderId);
    }

    return response.data;
  },

  /**
   * WEBHOOK VERIFICATION: Cryptographic check of Cashfree's payload
   */
  verifyWebhook: (rawBody, signature, timestamp) => {
    const signStr = timestamp + rawBody;
    const generatedSignature = crypto
      .createHmac("sha256", process.env.CF_SECRET_KEY)
      .update(signStr)
      .digest("base64");

    return generatedSignature === signature;
  },

  /**
   * SUBSCRIPTION FULFILLMENT: Atomic update of Payment & Subscription
   */
  fulfillSubscription: async (orderId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findOne({ order_id: orderId }).session(session);
      if (!payment || payment.status === "SUCCESS") {
        await session.abortTransaction();
        return;
      }

      const plan = await Plan.findById(payment.planId).session(session);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + (plan.validity_days || 30));

      // 1. Update Payment Status
      payment.status = "SUCCESS";
      await payment.save({ session });

      // 2. Upsert Subscription
      await Subscription.findOneAndUpdate(
        { institute: payment.institute },
        {
          plan: payment.planId,
          status: "ACTIVE",
          expiry_date: expiryDate,
          calls_used: 0
        },
        { upsert: true, session }
      );

      await session.commitTransaction();
    } catch (error) {
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