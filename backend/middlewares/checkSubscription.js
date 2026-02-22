import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";

export const checkSubscription = async (req, res, next) => {
  const { instituteId } = req.body;

  const sub = await Subscription.findOne({ institute: instituteId }).populate("plan");
  
  if (!sub || sub.status !== "ACTIVE") {
    return res.status(402).json({ message: "No active subscription found." });
  }

  if (sub.calls_used >= sub.plan.call_limit) {
    return res.status(403).json({ message: "Plan limit reached. Please upgrade." });
  }

  req.subscription = sub;
  next();
};