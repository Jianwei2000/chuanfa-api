import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import cors from 'cors';
import nodemailer from "nodemailer";
import admin from "firebase-admin";
// import fs from "fs";
import db from "../config/database.js";


const router = express.Router();

// 初始化 Firebase Admin SDK
// const serviceAccount = JSON.parse(
//   fs.readFileSync(
//     "./config/membership-system-7d179-firebase-adminsdk-fbsvc-51cab596a2.json"
//   )
// );
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

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
      { expiresIn: "1h" }
    );

    // 返回 JWT token
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//取得會員資料byId
// router.get("/:id", getUserById);

// 取得會員資料 API (需驗證)
// router.get('/user', async (req, res) => {
//   const authHeader = req.headers['authorization'];
//   console.log('Authorization Header:', authHeader);
//   if (!authHeader) return res.status(401).json({ message: '沒有提供令牌' });

//   const token = authHeader.split(' ')[1];
//   console.log('Extracted Token:', token);
//   if (!token) return res.status(401).json({ message: '令牌格式錯誤' });

//   try {
//       // 嘗試驗證 firebase id token
//       let decoded;
//       try {
//           decoded = await admin.auth().verifyIdToken(token)
//           console.log('Firebase Decoded Token', decoded)
//           const uid = decoded.uid // firebase 唯一用戶 id

//           // 檢查資料庫中是否有該用戶，沒有則創建一個
//           const sqlCheck = 'select id, username, email from users where firebase_uid = ?'
//           db.query(sqlCheck, [uid], (err, results) => {
//               if (err) {
//                   console.log('Database Error', err.message)
//                   return res.status(500).json({error: '資料庫查詢失敗', details: err.message })
//               }

//               if (results.length > 0) {
//                   // 用戶已存在，直接返回資料
//                   console.log('User Found', results[0]);
//                   return res.json(results[0])
//               }

//               // 若無則創建新用戶
//               const username = decoded.email.split('@')[0] || `firebase_${uid}` // 用 email 前綴貨 uid 作為默認用戶名
//               const email = decoded.email
//               const sqlInsert = 'insert into users (username, email, firebase_uid) values (?, ?, ?)'
//               db.query(sqlInsert, [username, email, uid], (err, result) => {
//                   if (err) {
//                       console.log('Database Insert Error', err.message)
//                       return res.status(500).json({error: '用戶創建失敗', details: err.message})
//                   }
//                   const newUser = {id: result.insertId, username, email}
//                   console.log('New User Created', newUser)
//                   res.json(newUser)
//               })
//           })
//       } catch (firebaseErr) {
//           console.log("Firebase Token Verification Failed:", firebaseErr.message);
//           // 如果不是 firebase token 就驗證自訂的 JWT
//           jwt.verify(token, 'your_jwt_secret', (jwtErr, jwtDecoded) => {
//               if (jwtErr){
//                   console.log('JWT Verify Error:', jwtErr.message)
//                   return res.status(401).json({message: '無效的令牌'})
//               }
//               console.log('JWT Decoded Token:', jwtDecoded)
//               const sql = 'select user_id, username, email from users where user_id = ?'
//               db.query(sql, [jwtDecoded.user_id], (err, results) => {
//                   if (err) {
//                       console.log("Database Error:", err.message)
//                       return res.status(500).json({error: '資料庫查詢失敗', details: err.message })
//                   }
//                   if (!results || results.length === 0){
//                       console.log('No user found for id:', jwtDecoded.id)
//                       return res.status(404).json({message: '用戶不存在'})
//                   }
//                   console.log('Query Result:', results[0])
//                   res.json(results[0])
//               })
//           })
//       }
//   } catch (err){
//       console.log('Unexpected Error:', err.message)
//       res.status(500).json({error: '伺服器錯誤', details: err.message})
//   }
// });

// 編輯會員資料 API (需驗證)
router.put("/user", async (req, res) => {
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader);
  if (!authHeader) return res.status(401).json({ message: "沒有提供令牌" });

  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token);
  if (!token) return res.status(401).json({ message: "令牌格式錯誤" });

  try {
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
      console.log("Firebase Decoded Token:", decoded);
      const uid = decoded.uid;
      const { username, email } = req.body;
      console.log("Request Body:", { username, email });

      if (!username || !email) {
        return res.status(400).json({ message: "缺少 username 或 email" });
      }

      const sqlCheck =
        "SELECT id FROM users WHERE username = ? AND firebase_uid != ?";
      db.query(sqlCheck, [username, uid], (err, result) => {
        if (err) {
          console.error("資料庫錯誤:", err);
          return res.status(500).json({ message: "內部錯誤" });
        }
        if (result.length > 0) {
          return res.status(400).json({ message: "此使用者名稱已被使用" });
        }

        const sqlUpdate =
          "UPDATE users SET username = ?, email = ? WHERE firebase_uid = ?";
        db.query(sqlUpdate, [username, email, uid], (err, updateResult) => {
          if (err) {
            console.error("更新錯誤:", err);
            return res.status(500).json({ message: "更新失敗" });
          }
          res.json({ message: "更新成功" });
        });
      });
    } catch (firebaseErr) {
      console.log("Firebase Token Verification Failed:", firebaseErr.message);
      jwt.verify(token, "your_jwt_secret", (jwtErr, jwtDecoded) => {
        if (jwtErr) {
          console.log("JWT Verify Error:", jwtErr.message);
          return res.status(401).json({ message: "無效的令牌" });
        }
        console.log("JWT Decoded Token:", jwtDecoded);
        const { username, email } = req.body;
        console.log("Request Body:", { username, email });

        if (!username || !email) {
          return res.status(400).json({ message: "缺少 username 或 email" });
        }

        const sqlCheck = "SELECT id FROM users WHERE username = ? AND id != ?";
        db.query(sqlCheck, [username, jwtDecoded.id], (err, result) => {
          if (err) {
            console.error("資料庫錯誤:", err);
            return res.status(500).json({ message: "內部錯誤" });
          }
          if (result.length > 0) {
            return res.status(400).json({ message: "此使用者名稱已被使用" });
          }

          const sqlUpdate =
            "UPDATE users SET username = ?, email = ? WHERE id = ?";
          db.query(
            sqlUpdate,
            [username, email, jwtDecoded.id],
            (err, updateResult) => {
              if (err) {
                console.error("更新錯誤:", err);
                return res.status(500).json({ message: "更新失敗" });
              }
              res.json({ message: "更新成功" });
            }
          );
        });
      });
    }
  } catch (err) {
    console.log("Unexpected Error:", err.message);
    res.status(500).json({ error: "伺服器錯誤", details: err.message });
  }
});

// 忘記密碼 - 發送重設連結到信箱
// app.post('/api/forgot-password', async (req, res) => {
//     const { email } = req.body;
//     console.log('Received email:', email)

//     if (!email) {
//         return res.status(400).json({message: '請提供電子信箱'})
//     }

//     const sql = 'select * from users where email = ?'
//     db.query(sql, [email], async (err, results) => {
//         if (err) {
//             console.log('資料庫錯誤:', err.message);
//             return res.status(500).json({error: err.message})
//         }
//         if (results.length === 0) {
//             return res.status(404).json({message: '該信箱未註冊'});
//         }

//         const user = results[0]
//         const resetToken = jwt.sign({id: user.id}, 'your_jwt_secret', {expiresIn: '15m'})
//         const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`

//         const mailOptions = {
//             from: 'qq26283871@gmail.com',
//             to: email,
//             subject: '重設密碼',
//             text: `請點擊以下連結重設您的密碼（15分鐘內有效）: ${resetLink}`,
//         }
//         console.log('Mail Option:', mailOptions)

//         try {
//             await transporter.sendMail(mailOptions)
//             console.log('Reset email sent to:', email)
//             return res.json({message: '重設密碼連結已發送到您的信箱'})
//         } catch (err) {
//             console.error('Email Error:', err.message);
//             return res.status(500).json({error: '發送郵件失敗'})
//         }
//     })
// })

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

    return res.json({message: "驗證成功", token: resetToken})
  } catch (err) {
    console.error("錯誤發生", err.message);
    return res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// 重設密碼
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  jwt.verify(token, "your_jwt_secret", async (err, decoded) => {
    if (err) {
      console.log("JWT Verify Error:", err.message);
      return res.status(401).json({ message: "無效或過期的新令牌" });
    }
    console.log("Decoded Token:", decoded);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = "update users set password = ? where id = ?";
    db.query(sql, [hashedPassword, decoded.id], (err, results) => {
      if (err) {
        console.log("Database Error:", err.message);
        return res
          .status(500)
          .json({ error: "資料庫更新失敗", details: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "用戶不存在" });
      }
      console.log("Password Reset Result:", results);
      res.json({ message: "密碼重設成功" });
    });
  });
});

export default router;
