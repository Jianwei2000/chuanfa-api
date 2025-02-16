import express from "express";
import user from "./routes/user.js";

const app = express();
//註冊樣板引擎
app.set("view engine", "ejs");
//設定靜態內容資料夾
app.use(express.static("public"));

//設定主頁路由
app.get("/",(req,res)=>{
    res.render("home");
})
//定義user路由
app.use("/user", user);


//設定404頁面
app.use((req,res)=>{
    res.status(404);
    res.send(`
        <h1 style=" text-align: center;;">404 迷路了嗎?</h1>
        <div><img src="images/404.jpg" width="100%" height="100%"></div>
    `);
})


//設定Server端口
const port = process.env.WEB_PORT || 3000;

//偵聽Server
app.listen(port,()=>{
    console.log(`Server啟動，偵聽的端口:${port}`);
})