import { Request, Response } from "express"
import { registerUser, loginUser } from "../services/authService"

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await registerUser(email, password)

    res.status(201).json({
      message: "User created",
      user
    })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const result = await loginUser(email, password)

    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message })
  }
}