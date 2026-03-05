import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" })
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, JWT_SECRET) as any

    // gắn user vào request
    ;(req as any).user = decoded

    next()

  } catch (error) {
    console.log("JWT ERROR:", error)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}