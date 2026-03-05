import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes"
import transactionRoutes from "./routes/transactionRoutes"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Finance Tracker API running")
})

app.use("/auth", authRoutes)
app.use("/api", transactionRoutes)

export default app