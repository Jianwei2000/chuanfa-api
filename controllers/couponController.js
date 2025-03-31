import Coupon from "../models/couponModel.js";

//取得所有優惠券
export const getCoupons = async (req, res)=>{
    try {
        const coupons = await Coupon.getAll();
        res.json({ coupons});
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

// 透過 user ID 取得他所擁有的優惠券
export const getCouponById = async (req, res)=>{
    try {
        const { id } = req.params;
        const { code } = req.query; // 從 query 取得 code 參數（可選）
        
        const userCoupons = await Coupon.getById(id, code);

        if (!userCoupons || userCoupons.length === 0) return res.json({ message: "沒有優惠券", userCoupons: [] });
        res.json({ message: "優惠券資料取得成功", userCoupons });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}

// 新增會員優惠卷
export const createUserCoupon = async (req, res) => {
    const { user_id, coupon_id, draw_date } = req.body;

    console.log(req.body);  // 這裡會顯示請求體的內容

    // 檢查是否所有必要的欄位都有傳遞
    if (!user_id || !coupon_id || !draw_date) {
        return res.status(400).json({ error: "缺少必要欄位" });
    }

    try {
        const couponRecords = await Coupon.create(user_id, coupon_id, draw_date);

        res.status(201).json({
            message: "優惠券已存入會員中心",
            couponRecords: couponRecords,
        });
    } catch (err) {
        res.status(500).json({ error: "優惠券新增失敗", detail: err.message });
    }
};