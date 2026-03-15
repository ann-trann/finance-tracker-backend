import { Router } from "express"
import { updateName, changePassword, getMe } from "../controllers/userController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.get("/user/me", protect, getMe)
router.patch("/user/name", protect, updateName)
router.patch("/user/password", protect, changePassword)

export default router