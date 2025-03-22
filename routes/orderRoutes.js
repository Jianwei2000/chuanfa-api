import express from "express";
import {
    createOrder,
    getOrderById,
    getProductsById
} from "../controllers/orderController.js";

const router = express.Router();


router.get("/:id", getOrderById); // 取得訂單
router.get("/:id/products", getProductsById); // 取得購買的商品資料
router.post("/", createOrder); // 新增訂單


export default router;