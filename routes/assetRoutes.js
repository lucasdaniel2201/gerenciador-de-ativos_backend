import express from "express";
import * as assetController from "../controllers/assetController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/",
  protect,
  assetController.checkAssetLimit,
  assetController.createAsset
);
router.get("/", protect, assetController.getAssets);
router.get("/:id", protect, assetController.getAssetById);
router.put("/:id", protect, assetController.updateAsset);
router.delete("/:id", protect, assetController.deleteAsset);

export default router;
