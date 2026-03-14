import { Request, Response } from "express"
import { Prisma } from "@prisma/client"
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
    const { name, initialBalance } = req.body
    const userId = (req as any).user.userId

    // Validation
    if (!name) {
      return res.status(400).json({
        message: "Wallet name is required"
      })
    }

    const startBalance = initialBalance ? Number(initialBalance) : 0

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        name,
        initialBalance: startBalance,
        balance: startBalance,
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

    const { name, initialBalance  } = req.body

    // Check wallet ownership
    const wallet = await prisma.wallet.findUnique({
      where: { id }
    })

    if (!wallet || wallet.userId !== userId) {
      return res.status(404).json({
        message: "Wallet not found"
      })
    }

    let newBalance = wallet.balance
    let newInitial = wallet.initialBalance

    if (initialBalance !== undefined) {

      const oldInitial = Number(wallet.initialBalance)
      const oldBalance = Number(wallet.balance)
      const newInitialValue = Number(initialBalance)

      const calculatedBalance = oldBalance - oldInitial + newInitialValue

      newBalance = new Prisma.Decimal(calculatedBalance)
      newInitial = new Prisma.Decimal(newInitialValue)
    }

    const updatedWallet = await prisma.wallet.update({
      where: { id },
      data: {
        name: name ?? wallet.name,
        initialBalance: newInitial,
        balance: newBalance
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
 * Delete wallet and its transactions
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

    // Delete transactions + wallet in a transaction
    await prisma.$transaction([

      prisma.transaction.deleteMany({
        where: {
          walletId: id
        }
      }),

      prisma.wallet.delete({
        where: { id }
      })

    ])

    res.json({
      message: "Wallet and its transactions deleted"
    })

  } catch (error) {
    console.error("Delete wallet error:", error)
    res.status(500).json({ message: "Server error" })
  }
}