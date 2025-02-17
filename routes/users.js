import express from "express";
import db from "../utils/db_connect.js";
const router = express.Router();

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

export default router;