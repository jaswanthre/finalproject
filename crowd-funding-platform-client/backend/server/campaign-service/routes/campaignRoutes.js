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
  getCampaignsByEmail,
  approveCampaign
} from "../controllers/campaignController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/campaigns/email/:email", getCampaignsByEmail);

router.post("/campaigns", upload.single("campaign_image"), createCampaign);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/:id", getCampaignById);
router.put("/campaigns/status/:id",approveCampaign);

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

export default router;
