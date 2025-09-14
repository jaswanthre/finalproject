import dotenv from "dotenv";
dotenv.config();
import express from "express";
import donorRoutes from "./routes/donorRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import pool from "./db/db.js";
const app = express();
app.use(express.json());

app.use("/donation", donorRoutes);
app.use("/transaction", transactionRoutes);


const start = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to Postgres at:", res.rows[0].now);
    app.listen(process.env.PORT, () => {
      console.log(`Donor service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Postgres connection failed:", err.message);
    process.exit(1);
  }
};

start();