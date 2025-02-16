import express from "express";
import db from "../utils/db_connect.js";
const router = express.Router();

// 取得會員所有資料
router.get("/", async (req, res) => {
    try {
        const [datas] = await db.query(`SELECT * FROM address_book ORDER BY ab_id DESC`);
        res.json({
            users: datas
        });
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
});


export default router;