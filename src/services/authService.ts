import prisma from "../prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export const registerUser = async (email: string, password: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("Email already exists")
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  return user
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if (!isMatch) {
    throw new Error("Invalid credentials")
  }

  const token = jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: "7d" }
  )

  return { token, user }
}