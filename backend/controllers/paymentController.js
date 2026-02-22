import { paymentService } from "../services/paymentService.js";

export const paymentController = {
  initiatePayment: async (req, res) => {
    console.log("--- START: Initiate Payment ---");
    try {
      const { planId } = req.body;
      const finalPlanId = typeof planId === 'object' ? planId.planId : planId;
      const instituteId = req.user._id;

      console.log("Input Params:", { instituteId, finalPlanId });

      if (!finalPlanId) {
        console.warn("Validation Failed: Missing planId");
        return res.status(400).json({ status: "error", message: "planId is required" });
      }

      const order = await paymentService.createOrder(instituteId, finalPlanId);
      
      console.log("Order Created Successfully:", order.order_id);
      res.status(201).json({ status: "success", data: order });
    } catch (err) {
      console.error("Controller Error (initiatePayment):", err.response?.data || err.message);
      res.status(400).json({
        status: "error",
        message: err.response?.data || err.message
      });
    } finally {
      console.log("--- END: Initiate Payment ---");
    }
  },

  verifyPayment: async (req, res) => {
    const { order_id } = req.query;
    console.log(`--- Verification Check: ${order_id} ---`);
    try {
      const result = await paymentService.checkPaymentStatus(order_id);
      console.log(`Status Result for ${order_id}:`, result.order_status);
      res.status(200).json({ status: "success", payment_status: result.order_status });
    } catch (err) {
      console.error(`Verification Error (${order_id}):`, err.message);
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  webhookHandler: async (req, res) => {
    console.log("--- INCOMING WEBHOOK ---");
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    try {
      const isAuthentic = paymentService.verifyWebhook(req.rawBody, signature, timestamp);
      
      if (!isAuthentic) {
        console.error("WEBHOOK AUTH FAILED: Invalid Signature");
        return res.status(401).send("Invalid Signature");
      }

      const event = JSON.parse(req.rawBody);
      console.log("Webhook Event Type:", event.type);
      console.log("Webhook Data:", JSON.stringify(event.data, null, 2));

      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        console.log("Triggering Fulfillment for:", event.data.order.order_id);
        await paymentService.fulfillSubscription(event.data.order.order_id);
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook Execution Crash:", err);
      res.status(500).send("Internal Error");
    }
  },
  getPlans: async (req, res) => {
    try {
      const plans = await paymentService.getAllPlans();
      res.status(200).json({ status: "success", data: plans });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  // GET /api/payment/my-subscription
  getMySubscription: async (req, res) => {
    try {
      const sub = await paymentService.getSubscriptionByInstitute(req.user._id);
      console.log("i am calling")
      if (!sub) return res.status(404).json({ message: "No subscription found" });
      
      res.status(200).json({ status: "success", data: sub });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  }
};