import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { profileUpload } from "../middleware/uploadMiddleware.js";
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from "../controllers/profileController.js";

const router = express.Router();

router.post("/", protect, profileUpload, createUserProfile);
router.get("/", protect, getUserProfile);
router.put("/", protect, profileUpload, updateUserProfile);
router.delete("/", protect, deleteUserProfile);

export default router;
