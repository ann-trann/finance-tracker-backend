import { Request, Response } from "express"
import prisma from "../prisma/client"

/**
 * =====================================
 * GET /wallets
 * =====================================
 * Get all wallets of the current user
 */
export const getWallets = async (req: Request, res: Response) => {
  try {
    // Get userId from JWT middleware
    const userId = (req as any).user.userId

    // Fetch wallets
    const wallets = await prisma.wallet.findMany({
      where: {
        userId
      },
      // newest wallets first
      orderBy: {
        createdAt: "desc"
      }
    })

    res.json(wallets)

  } catch (error) {
    console.error("Get wallets error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * POST /wallets
 * =====================================
 * Create a new wallet
 *
 * Body:
 * - name
 * - balance (optional)
 */
export const createWallet = async (req: Request, res: Response) => {
  try {
    const { name, balance } = req.body
    const userId = (req as any).user.userId

    // Validation
    if (!name) {
      return res.status(400).json({
        message: "Wallet name is required"
      })
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        name,
        balance: balance ? Number(balance) : 0,
        userId
      }
    })

    res.status(201).json(wallet)

  } catch (error) {
    console.error("Create wallet error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * GET /wallets/:id
 * =====================================
 * Get wallet detail
 */
export const getWalletById = async (req: Request, res: Response) => {
  try {

    const walletId = req.params.id as string
    const userId = (req as any).user.userId

    const wallet = await prisma.wallet.findFirst({
      where: {
        id: walletId,
        userId
      },
      include: {
        transactions: {
          orderBy: {
            date: "desc"
          },
          include: {
            category: true
          }
        }
      }
    })

    if (!wallet) {
      return res.status(404).json({
        message: "Wallet not found"
      })
    }

    // tính tổng thu chi
    const income = wallet.transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expense = wallet.transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    res.json({
      wallet,
      summary: {
        balance: wallet.balance,
        totalIncome: income,
        totalExpense: expense,
        transactionCount: wallet.transactions.length
      }
    })

  } catch (error) {
    console.error("Get wallet detail error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * PUT /wallets/:id
 * =====================================
 * Update wallet
 */
export const updateWallet = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).user.userId

    const { name, balance } = req.body

    // Check wallet ownership
    const wallet = await prisma.wallet.findUnique({
      where: { id }
    })

    if (!wallet || wallet.userId !== userId) {
      return res.status(404).json({
        message: "Wallet not found"
      })
    }

    // Update wallet
    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        name,
        balance: balance !== undefined ? Number(balance) : undefined
      }
    })

    res.json(updatedWallet)

  } catch (error) {
    console.error("Update wallet error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * DELETE /wallets/:id
 * =====================================
 * Delete wallet
 */
export const deleteWallet = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).user.userId

    // Check ownership
    const wallet = await prisma.wallet.findUnique({
      where: { id }
    })

    if (!wallet || wallet.userId !== userId) {
      return res.status(404).json({
        message: "Wallet not found"
      })
    }

    // Prevent deleting wallet with transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        walletId: id
      }
    })

    if (transactionCount > 0) {
      return res.status(400).json({
        message: "Cannot delete wallet with transactions"
      })
    }

    await prisma.wallet.delete({
      where: { id }
    })

    res.json({
      message: "Wallet deleted"
    })

  } catch (error) {
    console.error("Delete wallet error:", error)
    res.status(500).json({ message: "Server error" })
  }
}