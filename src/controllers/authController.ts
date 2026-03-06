import { Request, Response } from "express"
import { registerUser, loginUser } from "../services/authService"

// Handle user registration
export const register = async (req: Request, res: Response) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body

    // Call service to create a new user
    const user = await registerUser(email, password)

    // Return success response
    res.status(201).json({
      message: "User created",
      user
    })
  } catch (error: any) {
    // Return error if registration fails
    res.status(400).json({ error: error.message })
  }
}

// Handle user login
export const login = async (req: Request, res: Response) => {
  try {
    // Get login credentials
    const { email, password } = req.body

    // Call service to authenticate user
    const result = await loginUser(email, password)

    // Return token and user info
    res.json(result)
  } catch (error: any) {
    // Return error if login fails
    res.status(401).json({ error: error.message })
  }
}