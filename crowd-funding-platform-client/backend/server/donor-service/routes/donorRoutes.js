import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createDonation,
  getDonation,
  updateDonationStatus,
  deleteDonation,
  getDonationsByEmail,
  createOrder,
  verifyPayment
} from "../controllers/donorController.js";

const router = express.Router();

// Donation routes
router.post("/", createDonation);
router.get("/:id", getDonation);
router.put("/:id/status", updateDonationStatus);
router.delete("/:id", deleteDonation);
router.get("/email/:email", getDonationsByEmail);


router.post("/order",protect, createOrder);

router.post("/verify", protect,verifyPayment);  // Verify Razorpay payment signature

export default router;
