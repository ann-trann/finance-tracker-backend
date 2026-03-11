import { Request, Response } from "express"
import prisma from "../prisma/client"

/**
 * ===============================
 * GET /categories
 * ===============================
 * Get all categories available for the authenticated user
 *
 * This includes:
 *  - default system categories
 *  - categories created by the user
 *
 * Query params:
 *  - type (optional): income | expense
 */
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Get userId from JWT
    const userId = (req as any).user.userId
    const { type } = req.query              // Optional filter by category type

    // Fetch categories from database
    const categories = await prisma.category.findMany({
      where: {
        // filter by type if provided
        ...(type ? { type: type as any } : {}),

        // show both default and user categories
        OR: [
          { userId },
          { isDefault: true }
        ]
      },
      
      // include children categories (subcategory)
      include: {
        children: true
      },

      orderBy: {
        name: "asc"
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
 * ===============================
 * POST /categories
 * ===============================
 * Create a new category
 *
 * Body:
 *  - name
 *  - type (income | expense)
 *  - parentId (optional)
 *
 * Only user-created categories are allowed here.
 */
export const createCategory = async (req: Request, res: Response) => {
  try {
    // Get data from request body
    const { name, type, parentId } = req.body

    // Get userId from JWT
    const userId = (req as any).user.userId

    // Basic validation
    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required"
      })
    }

    // Validate type
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        message: "Invalid category type"
      })
    }

    // Save category to database
    const category = await prisma.category.create({
      data: {
        name,
        type,
        parentId,
        userId,
        isDefault: false
      }
    })

    // Return created category
    res.status(201).json(category)

  } catch (error: any) {
    // Handle Prisma unique constraint error
    if (error.code === "P2002") {
      return res.status(400).json({
        message: "Category already exists"
      })
    }

    console.error("Create category error:", error)

    // Server error
    res.status(500).json({ message: "Server error" })
  }
}


/**
 * ===============================
 * DELETE /categories/:id
 * ===============================
 * Delete a category
 *
 * Rules:
 *  - User can only delete their own categories
 *  - Default categories cannot be deleted
 */
export const deleteCategory = async (req: Request, res: Response) => {

  try {
    const userId = (req as any).user.userId
    const { id } = req.params

    // Find category
    const category = await prisma.category.findUnique({
      where: { id: id as string }
    })

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      })
    }

    // Prevent deleting system default categories
    if (category.isDefault) {
      return res.status(403).json({
        message: "Cannot delete default category"
      })
    }

    // Prevent deleting categories from other users
    if (category.userId !== userId) {
      return res.status(403).json({
        message: "Not allowed"
      })
    }

    // Delete category
    await prisma.category.delete({
      where: { id: id as string }
    })

    res.json({ message: "Category deleted successfully" })

  } catch (error) {
    console.error("Delete category error:", error)
    res.status(500).json({ message: "Server error" })
  }
}