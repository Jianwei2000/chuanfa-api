import express from "express";
import moment from "moment-timezone";
import db from "../utils/db_connect.js";

const router = express.Router();

router.get("/", async (req, res) => {
    //分頁功能
    const perPage = 30;
    let page = +req.query.page || 1;
    let keyword = req.query.keyword ? req.query.keyword.trim() : "";

    if (page < 1) {
        return res.redirect(`?page=1`); //跳轉到第1頁
    }

    //搜尋功能
    let where = `WHERE 1`
    if (keyword) {
        let keyword_ = db.escape(`%${keyword}%`);
        where += ` AND (name LIKE ${keyword_} OR mobile LIKE ${keyword_})`;
    }

    const t_sql = `SELECT COUNT(1) AS totalRows FROM address_book ${where}`;
    const [
        [{
            totalRows
        }]
    ] = await db.query(t_sql); //取資料總筆數
    const totalPages = Math.ceil(totalRows / perPage); //取總頁數 
    let rows = [];

    if (totalRows) {

        if (page > totalPages) {
            return res.redirect(`?page=${totalPages}`); //跳轉到最後1頁
        }

        const sql = `SELECT * FROM address_book ${where} ORDER BY ab_id DESC LIMIT ${(page-1) * perPage}, ${perPage}`;
        [rows] = await db.query(sql);
        rows.forEach((row) => {
            const b = moment(row.birthday);
            row.birthday = b.isValid() ? b.format("YYYY-MM-DD") : "";
        })
    }


    // res.json({perPage, totalRows, totalPages, page, rows});  
    res.render("user", {
        perPage,
        totalRows,
        totalPages,
        page,
        rows,
        keyword
    });
});

router.get("/add", async (req, res) => {
    res.render("add-user")
});



export default router;