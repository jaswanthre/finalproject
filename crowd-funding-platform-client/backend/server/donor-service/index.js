import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import donorRoutes from "./routes/donorRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import pool from "./db/db.js";

const app = express();

// Middleware
app.use(cors());           // Allow requests from other origins
app.use(express.json());   // Parse JSON request bodies

// Routes
app.use("/donation", donorRoutes);
app.use("/transaction", transactionRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Donor service API is running...");
});

// Start server after confirming DB connection
const start = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to Postgres at:", res.rows[0].now);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Donor service running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Postgres connection failed:", err.message);
    process.exit(1);
  }
};

start();
