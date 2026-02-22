import express from "express";
import * as ttCtrl from "../controllers/timetableController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";
import { checkSubscription } from "../middlewares/checkSubscription.js";

const router = express.Router();

router.use(isLoggedIn);

// Only the /generate route needs to check for subscription limits
router.post("/generate", checkSubscription, ttCtrl.createTimetable);

router.get("/", ttCtrl.searchTimetables);
router.delete("/:id", ttCtrl.deleteTimetable);

export default router;