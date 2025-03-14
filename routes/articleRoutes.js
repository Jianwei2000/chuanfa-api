import express from "express";

import {
    getArticles,
    getArticleById,
  } from "../controllers/articleController.js";
  
  const router = express.Router();
  
  router.get("/", getArticles); // 取得文章資料（含搜尋、分頁）
  router.get("/:id", getArticleById); // 取得文章資料（含搜尋、分頁）
  
  export default router;
  