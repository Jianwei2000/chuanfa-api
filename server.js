import express from "express";
import userRoutes from "./routes/userRoutes.js"
import cors from "cors";

const app = express();

//中間件
app.use(cors());
app.use(express.json());

//設定users API路由
app.use("/users", userRoutes);

//設定Server端口
const port = process.env.WEB_PORT || 3000;

//偵聽Server
app.listen(port, () => {
    console.log(`Server啟動，偵聽的端口:${port}`);
})