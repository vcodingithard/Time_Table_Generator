import express from "express";
import * as courseCtrl from "../controllers/courseController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn);

router.route("/")
  .get(courseCtrl.getCourses)
  .post(courseCtrl.createCourse);

router.route("/:id")
  .get(courseCtrl.getCourseById)
  .put(courseCtrl.updateCourse)
  .delete(courseCtrl.deleteCourse);

// You can keep your seed route if needed, 
// but it's best to move that logic into a service too!
// router.post("/seed", courseCtrl.seedCourses);

export default router;