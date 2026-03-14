import express from "express"
import { register, login, deleteAccount } from "../controllers/authController"
import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.post("/register", register)
router.post("/login", login)

// delete account
router.delete("/account", protect, deleteAccount)

export default router