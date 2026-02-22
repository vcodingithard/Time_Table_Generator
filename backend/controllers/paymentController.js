import { paymentService } from "../services/paymentService.js";

export const paymentController = {
  // ROUTE 1: Create Order
  initiatePayment: async (req, res) => {
    try {
      const { planId, phone, email } = req.body;
      const order = await paymentService.createOrder(req.user.instituteId, planId, { phone, email });
      res.status(201).json({ status: "success", data: order });
    } catch (err) {
      res.status(400).json({ status: "error", message: err.message });
    }
  },

  // ROUTE 2: Verify Status (Polled by frontend)
  verifyPayment: async (req, res) => {
    try {
      const { order_id } = req.query;
      const result = await paymentService.checkPaymentStatus(order_id);
      res.status(200).json({ status: "success", payment_status: result.order_status });
    } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
    }
  },

  // ROUTE 3: Webhook (Server-to-Server)
  webhookHandler: async (req, res) => {
    const signature = req.headers["x-webhook-signature"];
    const timestamp = req.headers["x-webhook-timestamp"];

    try {
      const isAuthentic = paymentService.verifyWebhook(req.rawBody, signature, timestamp);
      if (!isAuthentic) return res.status(401).send("Invalid Signature");

      const event = JSON.parse(req.rawBody);
      if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
        await paymentService.fulfillSubscription(event.data.order.order_id);
      }

      res.status(200).send("OK");
    } catch (err) {
      console.error("Webhook Processing Failed:", err);
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