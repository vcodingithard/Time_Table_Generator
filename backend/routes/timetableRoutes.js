import express from "express";
import * as ttCtrl from "../controllers/timetableController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn);

// POST /api/timetable/generate -> Needs classId and suggestions in body
router.post("/generate", ttCtrl.createTimetable);

// GET /api/timetable/search -> Use query params like ?semester=5
router.get("/", ttCtrl.searchTimetables);

// DELETE /api/timetable/:id
router.delete("/:id", ttCtrl.deleteTimetable);

export default router;