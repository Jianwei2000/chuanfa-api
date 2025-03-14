import express from "express";
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import articleRoutes from "./routes/articleRoutes.js"
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

// 設定靜態文件目錄
app.use("/images", express.static(path.join(__dirname, "public", "images"))); // 靜態文件路徑

//設定users API路由
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/articles", articleRoutes);

//設定Server端口
const port = process.env.WEB_PORT || 3000;

//偵聽Server
app.listen(port, () => {
    console.log(`Server啟動，偵聽的端口:${port}`);
})