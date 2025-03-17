import db from "../config/database.js";

const Coupon = {
    // 取得所有優惠券
    getAll: async () => {
      const [coupons] = await db.query(`SELECT * FROM coupons`);
      return coupons;
    },
  
   
    // 透過 user ID 取得他所擁有的優惠券
    getById: async (id) => {
      const [result] = await db.query(
        `SELECT * FROM coupons_records cr 
        LEFT JOIN coupons c ON cr.coupon_id = c.id 
        WHERE user_id =  ?`, [id]);
      return result.length ? result : [];
    }, 
};
  
export default Coupon;