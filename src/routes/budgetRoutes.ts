import express from "express"
import {
  getBudgets,
  createBudget,
  deleteBudget,
  getBudgetProgress
} from "../controllers/budgetController"

import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/budgets", protect, getBudgets)

router.get("/budgets/progress", protect, getBudgetProgress)

router.post("/budgets", protect, createBudget)

router.delete("/budgets/:id", protect, deleteBudget)

export default router