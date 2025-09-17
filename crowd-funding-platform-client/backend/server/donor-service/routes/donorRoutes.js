import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createDonation,
  getDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationsByEmail,
  getAllDonations,
  createOrder,
  verifyPayment
} from "../controllers/donorController.js";

const router = express.Router();

router.post("/", createDonation);
router.get("/", getAllDonations);     // Get all donations
router.get("/:id", getDonation);
router.put("/:id/status", updateDonationStatus);
router.delete("/:id", deleteDonation);
router.get("/email/:email", getDonationsByEmail);

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
