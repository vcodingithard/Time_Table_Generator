import express from "express";
import * as classCtrl from "../controllers/classController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn); // Apply to all routes in this file

router.route("/")
  .get(classCtrl.getClasses)
  .post(classCtrl.createClass);

router.route("/:id")
  .get(classCtrl.getClassById)
  .put(classCtrl.updateClass)
  .delete(classCtrl.deleteClass);

export default router;