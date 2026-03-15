import { Request, Response } from "express"
import { updateUserName, changeUserPassword } from "../services/userService"
import prisma from "../prisma/client"

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, createdAt: true }
    })
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({ user })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const updateName = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" })
    const user = await updateUserName(userId, name.trim())
    res.json({ message: "Name updated", user })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both passwords are required" })
    const result = await changeUserPassword(userId, currentPassword, newPassword)
    res.json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}