import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import cors from 'cors';
import nodemailer from "nodemailer";
import admin from "firebase-admin";
import fs from "fs";
import db from "../config/database.js";

const router = express.Router();

// 從環境變數中讀取憑證
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;

if (!serviceAccountPath) {
  throw new Error("FIREBASE_CREDENTIALS_PATH 環境變數未設置");
}

// 讀取並解析 JSON 文件
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// 初始化 Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// 設置 nodemailer
const { EMAIL_USER, EMAIL_PASS } = process.env;
console.log("EMAIL_USER:", EMAIL_USER);
console.log("EMAIL_PASS:", EMAIL_PASS ? "Loaded" : "Not Loaded");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER, // 替換為你的 Gmail
    pass: EMAIL_PASS, // Gmail 應用程式密碼
  },
});

// 註冊 API
router.post("/", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 檢查用戶名和信箱是否已存在
    const checkSql = "SELECT * FROM users WHERE username = ? OR email = ?";
    const [results] = await db.query(checkSql, [username, email]);

    if (results.length > 0) {
      return res.status(400).json({ message: "用戶名或信箱已存在" });
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入新用戶
    const sql =
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
    await db.query(sql, [username, hashedPassword, email]);

    res.status(201).json({ message: "註冊成功" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 登入 API
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查詢用戶是否存在
    const sql = "SELECT * FROM users WHERE username = ?";
    const [results] = await db.query(sql, [username]);

    // 若用戶不存在
    if (results.length === 0) {
      return res.status(401).json({ message: "用戶不存在" });
    }

    const user = results[0];

    // 比對密碼是否正確
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "帳號或密碼錯誤" });
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.user_id, username: user.username, email: user.email },
      "your_jwt_secret",
      { expiresIn: "12h" }
    );

    // 返回 JWT token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Google 登入 API
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "請提供 Google token" });
    }

    // 驗證 token
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;
    const email = decoded.email;
    const username = email.split("@")[0];

    // 檢查用戶是否存在
    const checkSql = "select * from users where firebase_uid = ?";
    const [results] = await db.query(checkSql, [uid]);

    let jwtToken;

    if (results.length > 0) {
      // 用戶存在，生成 JWT token
      const user = results[0];
      jwtToken = jwt.sign(
        { id: user.user_id, username: user.username, email: user.email },
        "your_jwt_secret",
        { expiresIn: "12h" }
      );
    } else {
      // 用戶不存在，創建新用戶
      const insertSql =
        "insert into users (username, email, firebase_uid) values (?, ?, ?)";
      const [insertResult] = await db.query(insertSql, [username, email, uid]);
      const newUserId = insertResult.insertId;

      // 生成 JWT token
      jwtToken = jwt.sign(
        { id: newUserId, username, email },
        "your_jwt_secret",
        { expiresIn: "12h" }
      );
    }

    // 統一返回 JWT token
    res.json({ token: jwtToken });
  } catch (err) {
    console.error("Google 登入錯誤:", err);
    if (
      err.code === "auth/argument-error" ||
      err.code === "auth/invalid-id-token"
    ) {
      return res.status(401).json({ message: "無效的 Google ID token" });
    }
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 取得會員資料byId
router.get("/user", async (req, res) => {
  try {
    // 獲取 Authorization Headers
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader);
    if (!authHeader) {
      return res.status(401).json({ message: "沒有提供令牌" });
    }

    // 獲取 token
    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);
    if (!token) {
      return res.status(401).json({ message: "令牌格式有錯誤" });
    }

    // 解析 JWT token
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("JWT token:", decoded);

    // 從 JWT 中提取 id
    const userId = decoded.id;
    console.log("User id:", userId);

    // 查詢用戶資料
    const sql =
      "select user_id, username, email, phone_number, address, birthday from users where user_id = ?";
    const [results] = await db.query(sql, [userId]);

    if (results.length === 0) {
      console.log("No userfound:", userId);
      return res.status(404).json({ message: "查無此用戶" });
    }

    // 返回用戶資料
    console.log("Query result:", results);
    res.json(results[0]);
  } catch (err) {
    console.log("Error:", err);
    // 處理 JWT 相關錯誤
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "無效或過期的令牌" });
    }
    // 其他伺服器錯誤
    res.status(500).json({ error: "伺服器錯誤", details: err.message });
  }
});

// 編輯會員資料 API (需驗證)
router.put("/user", async (req, res) => {
  const authHeader = req.headers["authorization"];
  console.log("authorization header:", authHeader);
  if (!authHeader) {
    return res.status(401).json({ message: "沒有提供令牌" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Extracted token:", token);
  if (!token) {
    return res.status(401).json({ message: "令牌格式錯誤" });
  }

  try {
    // 解析 JWT
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("JWT decoded token:", decoded);

    const userId = decoded.id || decoded.uid;
    const { username, email, phone_number, address, birthday } = req.body;
    console.log("Request body:", {
      username,
      email,
      phone_number,
      address,
      birthday,
    });

    if (!username || !email) {
      return res.status(400).json({ message: "請輸入使用者或信箱" });
    }

    // 檢查是否存在
    const checkSql = "select * from users where username = ? and user_id != ?";
    console.log("開始查詢");
    const [checkResult] = await db.query(checkSql, [username, userId]);
    console.log("查詢完成，結果:", checkResult);
    if (checkResult.length > 0) {
      return res.status(409).json({ message: "此使用者名稱已被使用" });
    }
    console.log("準備更新用戶資料");

    //更新用戶資料
    const updateSql =
      "update users set username = ?, email = ?, phone_number = ?, address = ?, birthday = ? where user_id = ?";
    const [updateResults] = await db.query(updateSql, [
      username,
      email,
      phone_number || null,
      address || null,
      birthday || null,
      userId,
    ]);
    console.log("完成更新");
    if (updateResults.affectedRows === 0) {
      return res.status(404).json({ message: "查無此用戶" });
    }

    // 查詢更新後的用戶資料
    const [userResult] = await db.query(
      "select user_id, username, email, phone_number, address, birthday from users where user_id = ?",
      [userId]
    );
    const updatedUser = userResult[0];

    // 生成新 JWT token
    const newToken = jwt.sign(
      {
        id: updatedUser.user_id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
      "your_jwt_secret",
      { expiresIn: "12h" }
    );

    res.json({ message: "更新成功", token: newToken, user: updatedUser });
  } catch (err) {
    console.log(err);
    console.log("Token Verification or Unexpected Error:", err.message);
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "無效或過期的令牌" });
    }
    res.status(500).json({ error: "伺服器錯誤", details: err.message });
  }
});

// 忘記密碼
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log("接收的信箱:", email);

  if (!email) {
    return res.status(400).json({ message: "請提供電子信箱" });
  }

  try {
    const sql = "select * from users where email = ?";
    console.log("開始查詢資料庫:", sql, email);

    const [results] = await db.query(sql, [email]);
    console.log("查詢完成");
    console.log("查詢結果:", results);

    if (results.length === 0) {
      console.log("信箱未註冊");
      return res.status(404).json({ message: "該信箱未註冊" });
    }

    const user = results[0];
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 儲存驗證碼到資料庫
    const insertSql =
      "insert into verification_codes (user_id, code, expires_at) values (?, ?, ?)";
    await db.query(insertSql, [user.user_id, verificationCode, expiresAt]);
    console.log("驗證碼已存入資料庫");

    const mailOptions = {
      from: `"泉發 Chuan Fa" <${EMAIL_USER}>`,
      to: email,
      subject: "重設密碼驗證碼",
      text: `您的驗證碼是 ${verificationCode}，請在15分鐘內重設完畢`,
    };

    await transporter.sendMail(mailOptions);
    console.log("驗證碼成功寄送到：", email);
    return res.json({ message: "驗證碼已發送到您的信箱" });
  } catch (err) {
    console.error("錯誤發生:", err.message);
    return res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 驗證碼驗證
router.post("/verify-code", async (req, res) => {
  console.log("開始查詢");
  const { email, code } = req.body;

  // 檢查輸入是否完整
  if (!email || !code) {
    return res.status(400).json({ message: "請提供電子信箱和驗證碼" });
  }

  try {
    // 查詢用戶
    const sql = "select * from users where email = ?";
    console.log("接收到的信箱:", email);
    const [results] = await db.query(sql, [email]);
    console.log("查詢結果:", results);
    if (results.length === 0) {
      return res.status(400).json({ message: "該信箱未註冊" });
    }

    const user = results[0];

    // 檢查是否有效
    const verifySql =
      "select * from verification_codes where user_id = ? and code =? and expires_at > NOW()";
    const [verifyResults] = await db.query(verifySql, [user.user_id, code]);
    if (verifyResults.length === 0) {
      return res.status(400).json({ message: "驗證碼無效或過期" });
    }

    // 驗證成功生成 token
    const resetToken = jwt.sign({ id: user.user_id }, "your_jwt_secret", {
      expiresIn: "15m",
    });

    // 刪除已使用的驗證碼
    const deleteSql = "delete from verification_codes where user_id = ?";
    const [deleteResults] = await db.query(deleteSql, [user.user_id]);

    return res.json({ message: "驗證成功", token: resetToken });
  } catch (err) {
    console.error("錯誤發生", err.message);
    return res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 重設密碼
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // 驗證 JWT
    const decoded = jwt.verify(token, "your_jwt_secret");
    console.log("Decoded Token:", decoded);

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新資料庫中的密碼
    const sql = "update users set password = ? where user_id = ?";
    const [results] = await db.query(sql, [hashedPassword, decoded.id]);
    console.log("Password Reset Result:", results);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "用戶不存在" });
    }
    res.json({ message: "密碼重設成功" });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      console.log("JWT Verify Error:", err.message);
      return res.status(401).json({ message: "無效或過期的新令牌" });
    }
    console.error("發生錯誤:", err.message);
    return res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 驗證舊密碼
router.post("/verify-password", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "沒有提供令牌" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "令牌格式錯誤" });
  }

  try {
    // 解析 JWT
    const decoded = jwt.verify(token, "your_jwt_secret");
    const userId = decoded.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "請提供舊密碼" });
    }

    // 查詢運戶
    const sql = "SELECT * from users where user_id = ?";
    const [results] = await db.query(sql, [userId]);
    if (results.length === 0) {
      return res.status(404).json("用戶不存在");
    }
    const user = results[0];

    // 比對就密碼
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "舊密碼不正確" });
    }

    res.json({ message: "驗證成功" });
  } catch (err) {
    console.error("驗證舊密碼錯誤:", err);
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "無效或過期的令牌" });
    }
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 更新密碼 API
router.put("/change-password", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "沒有提供令牌" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "令牌格式錯誤" });
  }

  try {
    // 解析 JWT
    const decoded = jwt.verify(token, "your_jwt_secret");
    const userId = decoded.id;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "請提供新密碼" });
    }

    // 加密新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密碼
    const sql = "UPDATE users SET password = ? WHERE user_id = ?";
    const [results] = await db.query(sql, [hashedPassword, userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "用戶不存在" });
    }

    res.json({ message: "密碼更新成功" });
  } catch (err) {
    console.error("更新密碼錯誤:", err);
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "無效或過期的令牌" });
    }
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

export default router;
