import express from "express";
import { paymentController } from "../controllers/paymentController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

// Middleware to capture raw body for webhook verification
const rawBodyMiddleware = express.raw({ type: "application/json" });

// 1. Create Order
router.post("/checkout", isLoggedIn, paymentController.initiatePayment);

// 2. Verify Status (Redirect Landing Page)
router.get("/verify-status", isLoggedIn, paymentController.verifyPayment);

// 3. Webhook (No 'isLoggedIn' middleware here as it's called by Cashfree)
router.post("/webhook", rawBodyMiddleware, paymentController.webhookHandler);

export default router;