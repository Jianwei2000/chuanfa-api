import express from "express";
import {
    createReserve,
    getReserveTables,
    getAllTables
} from "../controllers/reserveController.js";

const router = express.Router();

router.post("/", createReserve); // 新增預約資料
router.get("/tables", getAllTables); // 取得所有座位
router.get("/tables/:date", getReserveTables); // 抓取被預約的座位

export default router;