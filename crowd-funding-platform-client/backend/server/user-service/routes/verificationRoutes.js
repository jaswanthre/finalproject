import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isNGO } from "../middleware/isNGO.js";
import { isAdmin } from "../middleware/isAdmin.js";
import multer from "multer";
import {
  createVerification,
  getVerifications,
  updateVerification,
  deleteVerification,
} from "../controllers/verificationController.js";
import {
  listAllVerifications,
  updateVerificationStatus,
} from "../controllers/adminController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/",
  protect,
  isNGO,
  upload.fields([
    { name: "ngo_registration_doc", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_proof", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  createVerification
);

router.get("/", protect, isAdmin, listAllVerifications);
router.get("/:email", protect, getVerifications);

router.put(
  "/:email",
  protect,
  isNGO,
  upload.fields([
    { name: "ngo_registration_doc", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_proof", maxCount: 1 },
    { name: "id_proof", maxCount: 1 },
  ]),
  updateVerification
);
router.put("/status/:email", protect, isAdmin, updateVerificationStatus);

router.delete("/:email", protect, deleteVerification);

export default router;
