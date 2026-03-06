import prisma from "../prisma/client"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

// Secret key used to sign JWT tokens
const JWT_SECRET = process.env.JWT_SECRET!

/**
 * Register a new user
 * 
 * Steps:
 * 1. Check if the email already exists in the database
 * 2. Hash the user's password for security
 * 3. Create a new user record in the database
 * 4. Return the created user
 */
export const registerUser = async (email: string, password: string) => {

  // Check if a user with the same email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  // If email is already registered, throw an error
  if (existingUser) {
    throw new Error("Email already exists")
  }

  // Hash the password using bcrypt
  // The number 10 is the salt rounds (security level)
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create a new user in the database
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword
    }
  })

  // Return the created user
  return user
}


/**
 * Login user
 * 
 * Steps:
 * 1. Find user by email
 * 2. Compare the input password with the hashed password
 * 3. If valid, generate a JWT token
 * 4. Return token and user data
 */
export const loginUser = async (email: string, password: string) => {

  // Find user in database by email
  const user = await prisma.user.findUnique({
    where: { email }
  })

  // If user does not exist, throw error
  if (!user) {
    throw new Error("Invalid credentials")
  }

  // Compare input password with stored hashed password
  const isMatch = await bcrypt.compare(password, user.password)

  // If password does not match, throw error
  if (!isMatch) {
    throw new Error("Invalid credentials")
  }

  // Generate JWT token that contains the userId
  const token = jwt.sign(
    { userId: user.id }, // payload
    JWT_SECRET,          // secret key
    { expiresIn: "7d" }  // token expiration time
  )

  // Return token and user information
  return { token, user }
}