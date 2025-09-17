import dotenv from "dotenv";
dotenv.config();
import express from "express";
import campaignRoutes from "./routes/campaignRoutes.js";
import pool from "./db/db.js";
const app = express();
app.use(express.json());
app.use("/campaign", campaignRoutes);

const start = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to Postgres at:", res.rows[0].now);
    app.listen(5002, () => {
      console.log(`Campaign service running on port 5002}`);
    });
  } catch (err) {
    console.error("Postgres connection failed:", err.message);
    process.exit(1);
  }
};

start();
