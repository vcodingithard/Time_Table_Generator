import express from "express";
import * as metaCtrl from "../controllers/metadataController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn);

router.route("/")
  .get(metaCtrl.getAllMetadata)
  .post(metaCtrl.saveMetadata); // Handles both create and update

router.get("/class/:classId", metaCtrl.getMetadataByClass);
router.delete("/:id", metaCtrl.deleteMetadata);

export default router;