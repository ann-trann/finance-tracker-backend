import { Request, Response } from "express"
import prisma from "../prisma/client"

// Get all categories of the authenticated user
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get userId from JWT
    const userId = (req as any).user.userId

    // Fetch categories from database
    const categories = await prisma.category.findMany({
    where: {
      OR: [
        { userId: userId },
        { isDefault: true }
      ]
    }
})

    // Return categories
    res.json(categories)

  } catch (error) {
    // Server error
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * Create a new category
 * The request body must include: name and type (income or expense)
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    // Get data from request body
    const { name, type } = req.body

    // Get userId from JWT
    const userId = (req as any).user.userId

    // Save category to database
    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId,
        isDefault: false
      }
    })

    // Return created category
    res.status(201).json(category)

  } catch (error) {
    // Server error
    res.status(500).json({ message: "Server error" })
  }
}