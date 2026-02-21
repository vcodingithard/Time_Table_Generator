import express from "express";
import * as authCtrl from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);
router.get("/logout", authCtrl.logout);
router.get("/session", authCtrl.getSession); // Useful for frontend to check login status

export default router;