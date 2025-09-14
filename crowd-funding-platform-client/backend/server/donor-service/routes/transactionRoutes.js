import express from "express";
import {
  createTransaction,
  getTransaction,
  updateTransactionStatus,
  deleteTransaction,
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/:id", getTransaction);
router.put("/:id", updateTransactionStatus);
router.delete("/:id", deleteTransaction);

export default router;
