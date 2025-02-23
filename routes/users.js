import express from "express";
import db from "../utils/db_connect.js";
const router = express.Router();
import bcrypt from "bcryptjs"; // 引入 bcryptjs 用來加密密碼

// 取得會員資料 + 搜尋 + 分頁
router.get("/", async (req, res) => {
  const { keyword = "", page = 1, limit = 15 } = req.query;

  // 計算偏移量 (分頁)
  const offset = (page - 1) * limit;

  // 搜尋條件處理
  const searchQuery = keyword ? `WHERE user_name LIKE ?` : "";
  const searchValue = keyword ? `%${keyword}%` : null;

  try {
    // 查詢資料並加上分頁
    const [users] = await db.query(
      `SELECT * FROM users ${searchQuery} ORDER BY user_id DESC LIMIT ? OFFSET ?`,
      searchValue
        ? [searchValue, Number(limit), Number(offset)]
        : [Number(limit), Number(offset)]
    );

    // 取得資料總數，用來計算總頁數
    const [totalCount] = await db.query(
      `SELECT COUNT(*) as total FROM users ${searchQuery}`,
      searchValue ? [searchValue] : []
    );

    const totalRecords = totalCount[0].total;
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      users, // 當前頁的會員資料
      page, // 當前頁碼
      totalPages, // 總頁數
      totalRecords, // 總資料筆數
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
//新增會員
router.post("/", async (req, res) => {
  const {
    name,
    email,
    password,
    mobile,
    birthday = null,
    address = "",
  } = req.body;

  // 驗證資料是否完整
  if (!name || !email || !password || !mobile) {
    return res.status(400).json({
      error: "姓名，信箱，密碼，手機 為必填",
    });
  }

  try {
    // 將密碼進行雜湊處理
    const passwordHash = await bcrypt.hash(password, 10); // 10 是鹽值 (salt)

    // 將會員資料插入資料庫
    const result = await db.query(
      `INSERT INTO users (user_name, email, password_hash, phone_number,  address, birthday) 
            VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, mobile, address, birthday]
    );

    // 插入成功後，回傳成功訊息
    res.status(201).json({
      message: "會員新增成功",
      user: {
        id: result.insertId, // 回傳新增的會員 ID
        name,
        email,
        mobile,
        birthday,
        address,
      },
    });
  } catch (err) {
    console.error("新增會員錯誤:", err);
    res.status(500).json({
      error: "新增會員失敗，請稍後再試",
      detail: err.message,
    });
  }
});
//刪除會員
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    // 確認該會員是否存在
    const [user] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [
      userId,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        error: "會員不存在",
      });
    }

    // 執行刪除
    await db.query(`DELETE FROM users WHERE user_id = ?`, [userId]);

    res.json({
      message: "會員刪除成功",
    });
  } catch (err) {
    console.error("刪除會員錯誤:", err);
    res.status(500).json({
      error: "刪除會員失敗，請稍後再試",
      detail: err.message,
    });
  }
});
//取得單一會員資料
router.get("/:id",async (req,res)=>{
  const userId = req.params.id;

  try{
     // 確認該會員是否存在
     const [user] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [
      userId,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        error: "會員不存在",
      });
    }

    // 如果會員存在，回傳會員資料
    res.status(200).json({
      message: "會員資料取得成功",
      user: user[0], // 返回找到的會員資料
    });
  }
  catch{
    // 錯誤處理
    console.error("取得會員資料錯誤:", err);
    res.status(500).json({
      error: "取得會員資料失敗，請稍後再試",
      detail: err.message,
    });
  }
})

// 修改會員
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    user_name: name, // 修正變數名稱
    email,
    phone_number: mobile, // 修正變數名稱
    birthday,
    address
  } = req.body;

  const formattedBirthday = birthday && birthday.trim() !== "" ? birthday : null;
  const formattedAddress = address || "";

  console.log("接收到的請求內容:", req.body);

  try {
    if (!name || !email || !mobile) {
      return res.status(400).json({ error: "請提供完整的會員資料" });
    }

    const userId = Number(id); // 確保 ID 是數字
    if (isNaN(userId)) {
      return res.status(400).json({ error: "會員 ID 無效" });
    }

    const [rows] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "找不到該會員" });
    }

    const [result] = await db.query(
      `UPDATE users SET 
        user_name = ?, 
        email = ?,  
        phone_number = ?, 
        address = ?, 
        birthday = ? 
      WHERE user_id = ?`,
      [name, email, mobile, formattedAddress, formattedBirthday, userId]
    );

    console.log("更新結果:", result);

    if (result.affectedRows > 0) {
      res.status(200).json({
        message: "會員資料更新成功",
        user: { id: userId, name, email, mobile, birthday: formattedBirthday, address: formattedAddress },
      });
    } else {
      res.status(400).json({ error: "會員資料未更新，請確認您的資料是否有變更" });
    }
  } catch (err) {
    console.error("修改會員錯誤:", err.message, err);
    res.status(500).json({ error: "修改會員資料失敗，請稍後再試", detail: err.message });
  }
});




export default router;
