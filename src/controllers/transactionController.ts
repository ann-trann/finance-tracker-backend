import { Request, Response } from "express"
import prisma from "../prisma/client"

export const getTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user.userId

  const transactions = await prisma.transaction.findMany({
    where: { userId }
  })

  res.json(transactions)
}

export const createTransaction = async (req: Request, res: Response) => {
  const { amount, type, description, date, categoryId, userId } = req.body

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      description,
      date: new Date(date),
      categoryId,
      userId
    }
  })

  res.status(201).json(transaction)
}