import express from "express";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";

import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

// 使用 fileURLToPath 和 import.meta.url 來獲取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

//中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//除錯用
// app.use((req, res, next) => {
//   console.log(`🔍 收到請求: ${req.method} ${req.url}`);
//   console.log("🔍 查詢參數 (req.query):", req.query);
//   console.log("🔍 請求主體 (req.body):", req.body);
//   next();
// });

// 設定靜態文件目錄
app.use("/images", express.static(path.join(__dirname, "public", "images"))); // 靜態文件路徑

//設定 API路由
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/articles", articleRoutes);
app.use("/coupons", couponRoutes);
app.use("/shipment", shipmentRoutes);

//設定Server端口
const port = process.env.WEB_PORT || 3000;

//偵聽Server
app.listen(port, () => {
  console.log(`Server啟動，偵聽的端口:${port}`);
});
