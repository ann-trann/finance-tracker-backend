import { Request, Response } from "express"
import prisma from "../prisma/client"


/**
 * =====================================
 * GET /transactions
 * =====================================
 * Get all transactions of the current user
 * Supports filtering by month and type
 *
 * Query params:
 * - month: month number (01 - 12)
 * - type: income | expense
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Get userId from JWT token
    const userId = (req as any).user.userId
    const { month, type } = req.query

    // Base filter: only get transactions of the current user
    const where: any = { userId }

    // Optional filter by transaction type
    if (type) {
      where.type = type
    }

    // Optional filter by month
    if (month) {
      const start = new Date(`2026-${month}-01`)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      // Get transactions within the selected month
      where.date = {
        gte: start,
        lt: end
      }
    }

    // Query transactions from database
    const transactions = await prisma.transaction.findMany({
      where,
      // include related data for frontend
      include: {
        category: true,
        wallet: true
      },
      orderBy: { date: "desc" } // newest transactions first
    })

    res.json(transactions)

  } catch (error) {
    console.error("Get transactions error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * POST /transactions
 * =====================================
 * Create a new transaction
 *
 * Required fields:
 * - amount
 * - type
 * - date
 * - walletId
 *
 * Optional:
 * - description
 * - categoryId
 */
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { amount, type, description, date, categoryId, walletId } = req.body

    // Get userId from authenticated request
    const userId = (req as any).user.userId

    // Basic validation
    if (!amount || !type || !date || !walletId) {
      return res.status(400).json({
        message: "amount, type, date and walletId are required"
      })
    }

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount), // Prisma will convert to Decimal
        type,
        description,
        date: new Date(date),
        userId,
        categoryId,
        walletId
      }
    })

    res.status(201).json(transaction)

  } catch (error) {
    console.error("Create transaction error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * PUT /transactions/:id
 * =====================================
 * Update an existing transaction
 */
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).user.userId
    const { amount, type, description, date, categoryId, walletId } = req.body

    // Check if transaction belongs to user
    const existing = await prisma.transaction.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== userId) {
      return res.status(404).json({
        message: "Transaction not found"
      })
    }

    // Update transaction data
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: amount ? Number(amount) : undefined,
        type,
        description,
        date: date ? new Date(date) : undefined,
        categoryId,
        walletId
      }
    })

    res.json(transaction)

  } catch (error) {
    console.error("Update transaction error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * DELETE /transactions/:id
 * =====================================
 * Delete transaction
 */
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = (req as any).user.userId

    // Check ownership
    const transaction = await prisma.transaction.findUnique({
      where: { id }
    })

    if (!transaction || transaction.userId !== userId) {
      return res.status(404).json({
        message: "Transaction not found"
      })
    }

    // Remove transaction from database
    await prisma.transaction.delete({
      where: { id }
    })

    res.json({ message: "Transaction deleted" })

  } catch (error) {
    console.error("Delete transaction error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * GET /transactions/summary
 * =====================================
 * Get total income, expense and balance
 */
export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId

    // Calculate total income
    const income = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "income"
      },
      _sum: {
        amount: true
      }
    })

    // Calculate total expense
    const expense = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "expense"
      },
      _sum: {
        amount: true
      }
    })

    const totalIncome = Number(income._sum.amount) || 0
    const totalExpense = Number(expense._sum.amount) || 0

    // Return financial summary
    res.json({
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}