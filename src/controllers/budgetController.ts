import { Request, Response } from "express"
import { Prisma } from "@prisma/client"
import prisma from "../prisma/client"

/**
 * Helper: get first day of month
 */
const getPeriodStart = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * =====================================
 * GET /budgets
 * =====================================
 * Get budgets of a month
 */
export const getBudgets = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user.userId

    const { period } = req.query

    const periodStart = period
      ? getPeriodStart(new Date(period as string))
      : getPeriodStart(new Date())

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        periodStart
      },
      include: {
        category: true
      }
    })

    res.json(budgets)

  } catch (error) {
    console.error("Get budgets error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * POST /budgets
 * =====================================
 * Create or update budget
 */
export const createBudget = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user.userId

    const { categoryId, amount, period } = req.body

    if (!categoryId || !amount) {
      return res.status(400).json({
        message: "categoryId and amount required"
      })
    }

    const periodStart = period
      ? getPeriodStart(new Date(period))
      : getPeriodStart(new Date())

    const budget = await prisma.budget.upsert({

      where: {
        userId_categoryId_periodStart: {
          userId,
          categoryId,
          periodStart
        }
      },

      update: {
        amount: new Prisma.Decimal(amount)
      },

      create: {
        userId,
        categoryId,
        amount: new Prisma.Decimal(amount),
        periodStart
      }

    })

    res.status(201).json(budget)

  } catch (error) {
    console.error("Create budget error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * =====================================
 * DELETE /budgets/:id
 * =====================================
 */
export const deleteBudget = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user.userId
    const id = req.params.id

    const budget = await prisma.budget.findUnique({
      where: { id: id as string }
    })

    if (!budget || budget.userId !== userId) {
      return res.status(404).json({
        message: "Budget not found"
      })
    }

    await prisma.budget.delete({
      where: { id: id as string }
    })

    res.json({
      message: "Budget deleted"
    })

  } catch (error) {
    console.error("Delete budget error:", error)
    res.status(500).json({ message: "Server error" })
  }
}


export const getBudgetProgress = async (req: Request, res: Response) => {
  try {

    const userId = (req as any).user.userId

    const { period } = req.query

    const periodStart = period
      ? getPeriodStart(new Date(period as string))
      : getPeriodStart(new Date())

    const periodEnd = new Date(
      periodStart.getFullYear(),
      periodStart.getMonth() + 1,
      1
    )

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        periodStart
      },
      include: {
        category: true
      }
    })

    const results = []

    for (const budget of budgets) {

      const spent = await prisma.transaction.aggregate({

        _sum: { amount: true },

        where: {
          userId,
          categoryId: budget.categoryId,
          type: "expense",

          date: {
            gte: periodStart,
            lt: periodEnd
          }
        }

      })

      const spentAmount = Number(spent._sum.amount || 0)
      const budgetAmount = Number(budget.amount)

      results.push({

        budgetId: budget.id,
        category: budget.category.name,

        budget: budgetAmount,
        spent: spentAmount,

        remaining: budgetAmount - spentAmount,

        percent: budgetAmount
          ? Math.round((spentAmount / budgetAmount) * 100)
          : 0

      })
    }

    res.json(results)

  } catch (error) {
    console.error("Budget progress error:", error)
    res.status(500).json({ message: "Server error" })
  }
}