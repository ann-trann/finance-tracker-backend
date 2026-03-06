import express from "express"
import cors from "cors"

// Import route modules
import authRoutes from "./routes/authRoutes"
import transactionRoutes from "./routes/transactionRoutes"
import categoryRoutes from "./routes/categoryRoutes"

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

// Transaction-related routes
app.use("/api", transactionRoutes)

// Category-related routes
app.use("/api", categoryRoutes)

export default app