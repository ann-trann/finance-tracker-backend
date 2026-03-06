import { Request, Response } from "express"
import prisma from "../prisma/client"

/**
 * Get all transactions of the current user.
 * Supports filtering by month and transaction type.
 * 
 * Query params:
 * - month: month number (e.g. 03)
 * - type: "income" or "expense"
 */
export const getTransactions = async (req: Request, res: Response) => {
  try {
    // Get userId from JWT token (added by auth middleware)
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
      orderBy: { date: "desc" } // newest transactions first
    })

    res.json(transactions)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Create a new transaction for the current user.
 * Required fields:
 * - amount
 * - type (income / expense)
 * - description
 * - date
 * - categoryId
 */
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { amount, type, description, date, categoryId } = req.body

    // Get userId from authenticated request
    const userId = (req as any).user.userId

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        userId,
        categoryId
      }
    })

    res.status(201).json(transaction)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Update an existing transaction.
 * Transaction id is taken from request params.
 */
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string
    const { amount, type, description, date, categoryId } = req.body

    // Update transaction data
    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        categoryId
      }
    })

    res.json(transaction)

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Delete a transaction by id.
 */
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string

    // Remove transaction from database
    await prisma.transaction.delete({
      where: { id }
    })

    res.json({ message: "Transaction deleted" })

  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
}

/**
 * Get financial summary of the current user.
 * Returns:
 * - total income
 * - total expense
 * - balance (income - expense)
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