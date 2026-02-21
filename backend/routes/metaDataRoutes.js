// routes/metadataRoutes.js

import express from "express";
import * as metaCtrl from "../controllers/metadataController.js";
import isLoggedIn from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(isLoggedIn);

router.route("/")
  .post(metaCtrl.createMetadata)
  .get(metaCtrl.getAllMetadata);

router.route("/:id")
  .get(metaCtrl.getMetadataById)
  .put(metaCtrl.updateMetadata)
  .delete(metaCtrl.deleteMetadata);

export default router;