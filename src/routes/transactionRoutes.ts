import express from "express"
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary
} from "../controllers/transactionController"

import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/transactions", protect, getTransactions)
router.post("/transactions", protect, createTransaction)

router.put("/transactions/:id", protect, updateTransaction)
router.delete("/transactions/:id", protect, deleteTransaction)

// Get financial summary (e.g., total income/expense)
router.get("/summary", protect, getSummary)

export default router