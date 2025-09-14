import express from "express";
import {
  createDonation,
  getDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationsByEmail,
} from "../controllers/donorController.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/:id", getDonation);
router.put("/:id", updateDonationStatus);
router.delete("/:id", deleteDonation);
router.get("/email/:email", getDonationsByEmail);

export default router;
