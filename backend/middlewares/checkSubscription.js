import Subscription from "../models/Subscription.js";

export const checkSubscription = async (req, res, next) => {
  // Use req.user._id set by isLoggedIn middleware
  const instituteId = req.user._id;

  try {
    const sub = await Subscription.findOne({ institute: instituteId }).populate("plan");

    if (!sub || sub.status !== "ACTIVE") {
      return res.status(402).json({ 
        success: false, 
        message: "No active subscription found. Please subscribe to a plan." 
      });
    }

    // Check if current date is past expiry
    if (sub.expiry_date && new Date() > sub.expiry_date) {
        sub.status = "EXPIRED";
        await sub.save();
        return res.status(402).json({ success: false, message: "Subscription has expired." });
    }

    if (sub.calls_used >= sub.plan.call_limit) {
      return res.status(403).json({ 
        success: false, 
        message: `Plan limit of ${sub.plan.call_limit} calls reached. Please upgrade.` 
      });
    }

    req.subscription = sub; // Pass sub to next handlers
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Subscription verification failed." });
  }
};