import express from "express";
import * as roomCtrl from "../controllers/roomController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn);

router.route("/")
  .get(roomCtrl.getRooms)
  .post(roomCtrl.createRoom);

router.route("/:id")
  .get(roomCtrl.getRoomById)
  .put(roomCtrl.updateRoom)
  .delete(roomCtrl.deleteRoom);

export default router;