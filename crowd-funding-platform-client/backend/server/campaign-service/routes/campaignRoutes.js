import express from "express";
import multer from "multer";
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  createCategory,
  getCategories,
  mapCampaignCategory,
  addMedia,
  getMediaByCampaign,
  createDonation,
  getDonationsByCampaign,
  addComment,
  getCommentsByCampaign,
} from "../controllers/campaignController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Main campaign routes - match frontend API calls
router.post("/", upload.single("campaign_image"), createCampaign);
router.get("/", getCampaigns);
router.get("/:id", getCampaignById);
router.put("/:id", upload.single("campaign_image"), updateCampaign);
router.delete("/:id", deleteCampaign);

// Legacy routes for backward compatibility
router.post("/campaigns", upload.single("campaign_image"), createCampaign);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.put("/campaigns/:id", upload.single("campaign_image"), updateCampaign);
router.delete("/campaigns/:id", deleteCampaign);

router.post("/categories", createCategory);
router.get("/categories", getCategories);
router.post("/campaign-categories", mapCampaignCategory);

router.post("/media", upload.single("media_file"), addMedia);
router.get("/media/:campaign_id", getMediaByCampaign);

router.post("/donations", createDonation);
router.get("/donations/:campaign_id", getDonationsByCampaign);

router.post("/comments", addComment);
router.get("/comments/:campaign_id", getCommentsByCampaign);

// Campaign updates endpoint
router.get("/:id/updates", getCommentsByCampaign); // Temporarily using comments as updates

export default router;
