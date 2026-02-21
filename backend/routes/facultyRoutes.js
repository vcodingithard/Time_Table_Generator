import express from "express";
import * as facultyCtrl from "../controllers/facultyController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(isLoggedIn);

router.route("/")
  .get(facultyCtrl.getFaculty)
  .post(facultyCtrl.createFaculty);

router.route("/:id")
  .put(facultyCtrl.updateFaculty)
  .delete(facultyCtrl.deleteFaculty);

// Specific route for managing course assignments
router.put("/:id/courses", facultyCtrl.syncCourses);

export default router;