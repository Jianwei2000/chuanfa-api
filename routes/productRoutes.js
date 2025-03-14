import express from "express";

import {
  getProducts,
  getProductById,
  getProductImages,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts); // 取得商品資料（含搜尋、分頁）
router.get("/:id", getProductById); // 取得商品資料
router.get("/:id/images", getProductImages); // 取得商品圖

export default router;
