import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// Secret key to verify JWT
const JWT_SECRET = process.env.JWT_SECRET as string

// Middleware to protect routes using JWT authentication
export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  // Get Authorization header from request
  const authHeader = req.headers.authorization

  // Check if header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Extract token
  const token = authHeader.split(" ")[1]

  try {
    // Verify token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET)

    // Attach decoded user info to request
    ;(req as any).user = decoded

    // Continue to the next middleware or route handler
    next()

  } catch (error) {
    // Token invalid
    return res.status(401).json({ message: "Invalid token" })
  }
}