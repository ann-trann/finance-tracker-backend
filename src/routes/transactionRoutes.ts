import express from "express"
import { getTransactions, createTransaction } from "../controllers/transactionController"
import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/transactions", protect, getTransactions)
router.post("/transactions", protect, createTransaction)

export default router