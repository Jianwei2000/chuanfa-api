import express from "express";
import db from "../utils/db_connect.js";
const router = express.Router();
import bcrypt from "bcryptjs"; // 引入 bcryptjs 用來加密密碼

// 取得會員資料 + 搜尋 + 分頁
router.get("/", async (req, res) => {
    const {
        keyword = "", page = 1, limit = 15
    } = req.query;

    // 計算偏移量 (分頁)
    const offset = (page - 1) * limit;

    // 搜尋條件處理
    const searchQuery = keyword ? `WHERE user_name LIKE ?` : "";
    const searchValue = keyword ? `%${keyword}%` : null;

    try {
        // 查詢資料並加上分頁
        const [users] = await db.query(
            `SELECT * FROM users ${searchQuery} ORDER BY user_id DESC LIMIT ? OFFSET ?`,
            searchValue ? [searchValue, Number(limit), Number(offset)] : [Number(limit), Number(offset)]
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
            totalRecords // 總資料筆數
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
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
        address = ""
    } = req.body;

    // 驗證資料是否完整
    if (!name || !email || !password || !mobile) {
        return res.status(400).json({
            error: "姓名，信箱，密碼，手機 為必填"
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
                address
            }
        });
    } catch (err) {
        console.error("新增會員錯誤:", err);
        res.status(500).json({
            error: "新增會員失敗，請稍後再試",
            detail: err.message

        });
    }
});

export default router;