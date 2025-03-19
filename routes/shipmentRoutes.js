import express from "express";

const router = express.Router();

// 當前端發送 POST 請求到 /shipment/711 時，將資料重定向到前端伺服器
router.post('/711', function (req, res) {
    // 將 req.body 轉換為 URL 查詢參數，並重定向到前端
    const queryParams = new URLSearchParams(req.body).toString();
    res.redirect(`http://127.0.0.1:3000/ship/callback?${queryParams}`);
  });

export default router;