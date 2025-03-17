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
        const userCoupons = await Coupon.getById(req.params.id);

        if (!userCoupons) return res.status(404).json({ error: "沒有任何優惠券" });
        res.json({ message: "優惠券資料取得成功", userCoupons });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
}