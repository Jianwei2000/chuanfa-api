import express from "express";


import {
    getCoupons,
    getCouponById,
    createUserCoupon
} from "../controllers/couponController.js";

const router = express.Router();
  
router.get("/", getCoupons); // 取得所有優惠券
router.get("/:id", getCouponById); // 會員id找他們的優惠券
router.post("/", createUserCoupon); // 新增優惠券給會員
export default router;