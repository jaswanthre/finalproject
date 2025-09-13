import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import {
  getUserByEmail,
  updateUserRole,
  deleteUserAccount,
  getProfileByUserEmail,
  deleteProfileByUserEmail,
  listAllUsers,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, isAdmin, listAllUsers);
router.get("/user/:email", protect, isAdmin, getUserByEmail);
router.put("/user/role", protect, isAdmin, updateUserRole);
router.delete("/user", protect, isAdmin, deleteUserAccount);

router.get("/profile/:email", protect, isAdmin, getProfileByUserEmail);
router.delete("/profile", protect, isAdmin, deleteProfileByUserEmail);

export default router;
