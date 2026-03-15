import express from "express"
import cors from "cors"

// Import route modules
import authRoutes from "./routes/authRoutes"
import userRoutes from "./routes/userRoutes"
import transactionRoutes from "./routes/transactionRoutes"
import categoryRoutes from "./routes/categoryRoutes"
import walletRoutes from "./routes/walletRoutes"
import budgetRoutes from "./routes/budgetRoutes"

const app = express()

// Enable CORS to allow requests from other domains
app.use(cors())

// Parse incoming JSON requests
app.use(express.json())


// Test route to check if API is running
app.get("/", (req, res) => {
  res.send("Finance Tracker API running")
})


// Authentication routes (register, login)
app.use("/auth", authRoutes)

// User related routes
app.use("/api", userRoutes)

// Transaction-related routes
app.use("/api", transactionRoutes)

// Category-related routes
app.use("/api", categoryRoutes)

// Category-related routes
app.use("/api", walletRoutes)

// Budget-related routes
app.use("/api", budgetRoutes)
export default app