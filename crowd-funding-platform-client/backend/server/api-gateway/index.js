import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(
  "/api/users",
  createProxyMiddleware({
    target: process.env.USER_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" },
  })
);

app.use(
  "/api/campaigns",
  createProxyMiddleware({
    target: process.env.CAMPAIGN_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/campaigns": "" },
  })
);

app.use(
  "/api/donors",
  createProxyMiddleware({
    target: process.env.DONOR_SERVICE,
    changeOrigin: true,
    pathRewrite: { "^/api/donors": "" },
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
