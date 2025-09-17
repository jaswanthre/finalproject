import express from "express";
import {
  createTransaction,
  getTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getAllTransactions, // import the new controller
} from "../controllers/transactionController.js";

const router = express.Router();

router.post("/", createTransaction);
router.get("/", getAllTransactions); // added route to fetch all transactions
router.get("/:id", getTransaction);
router.put("/:id", updateTransactionStatus);
router.delete("/:id", deleteTransaction);

export default router;
