import express from "express";
import {
    createReserve,
    getReserveTables,
    getAllTables,
    getUserReserve,
    updateReserve
} from "../controllers/reserveController.js";

const router = express.Router();

router.post("/", createReserve); // 新增預約資料
router.get("/tables", getAllTables); // 取得所有座位
router.get("/tables/:date", getReserveTables); // 抓取被預約的座位
router.get("/user/:id", getUserReserve); // 抓取會員預約的資料
router.put("/:id", updateReserve); // 更新會員預約的狀態

export default router;