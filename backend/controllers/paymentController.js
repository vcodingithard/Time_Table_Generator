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
  // In paymentController.js
webhookHandler: async (req, res) => {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"]; // Capture this header
    const rawBody = req.rawBody; 

    try {
        if (!rawBody || !signature || !timestamp) {
            console.error("Missing Webhook components");
            return res.status(400).send("Bad Request");
        }

        // Pass the timestamp here
        const isValid = paymentService.verifyWebhook(rawBody, signature, timestamp);

        if (!isValid) {
            console.warn("❌ Invalid Webhook Signature!");
            return res.status(401).send("Invalid Signature");
        }

        const event = JSON.parse(rawBody);
        await paymentService.processWebhook(event);

        res.status(200).send("OK");
    } catch (err) {
        console.error("Webhook Error:", err.message);
        res.status(500).send("Internal Error");
    }
},
  verifyPayment: async (req, res) => {
    try {
      const { order_id } = req.query;

      const status = await paymentService.getPaymentStatus(order_id);

      res.json({ status });

    } catch (err) {
      res.status(400).json({ message: err.message });
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