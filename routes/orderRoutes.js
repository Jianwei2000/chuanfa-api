import express from "express";
import {
    createOrder,
    getOrderById,
    getProductsById,
    updateOrderStatus
} from "../controllers/orderController.js";

const router = express.Router();


router.get("/:id", getOrderById); // 取得訂單
router.get("/:id/products", getProductsById); // 取得購買的商品資料
router.post("/", createOrder); // 新增訂單
router.put("/:id", updateOrderStatus); // 修改訂單狀態


export default router;