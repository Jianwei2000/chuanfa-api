import express from "express";
import usersApi from "./routes/users.js";
import cors from "cors";

const app = express();

//中間件
app.use(cors());
app.use(express.json());

//設定users API路由
app.use("/users", usersApi);

//設定404頁面
app.use((req, res) => {
    res.status(404);
    res.send(`
        <h1 style=" text-align: center;">404 迷路了嗎?</h1>
    `);
})

//設定Server端口
const port = process.env.WEB_PORT || 3000;

//偵聽Server
app.listen(port, () => {
    console.log(`Server啟動，偵聽的端口:${port}`);
})