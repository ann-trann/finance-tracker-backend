import express from "express"
import {
  getWallets,
  createWallet,
  getWalletById,
  updateWallet,
  deleteWallet
} from "../controllers/walletController"

import { protect } from "../middleware/authMiddleware"

const router = express.Router()

router.get("/wallets", protect, getWallets)
router.get("/wallets/:id", protect, getWalletById)

router.post("/wallets", protect, createWallet)

router.put("/wallets/:id", protect, updateWallet)

router.delete("/wallets/:id", protect, deleteWallet)

export default router