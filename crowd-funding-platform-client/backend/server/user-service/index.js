import dotenv from "dotenv";
dotenv.config();
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import pool from "./db/db.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/verifications", verificationRoutes);

const start = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Connected to Postgres at:", res.rows[0].now);
    app.listen(process.env.PORT, () => {
      console.log(`User Service running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Postgres connection failed:", err.message);
    process.exit(1);
  }
};

start();
