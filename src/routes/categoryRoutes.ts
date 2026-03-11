import express from "express"
import { 
    getCategories, 
    createCategory,
    deleteCategory
} from "../controllers/categoryController"
import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/categories", protect, getCategories)
router.post("/categories", protect, createCategory)

router.delete("/:id", protect, deleteCategory)

export default router