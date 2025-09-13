import express from "express";
import {
  createDonation,
  getDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationsByDonorEmail,
} from "../controllers/donorController.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", getDonationsByDonorEmail); // Route for getting donations by donor email
router.get("/:id", getDonation);
router.put("/:id", updateDonationStatus);
router.delete("/:id", deleteDonation);

export default router;
