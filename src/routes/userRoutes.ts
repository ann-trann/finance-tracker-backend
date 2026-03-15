import { Router } from "express"
import { updateName, changePassword } from "../controllers/userController"
import { protect } from "../middleware/authMiddleware"

const router = Router()

router.patch("/user/name", protect, updateName)
router.patch("/user/password", protect, changePassword)

export default router