import db from "../config/database.js";

const Coupon = {
    // 取得所有優惠券
    getAll: async () => {
      const [coupons] = await db.query(`SELECT * FROM coupons`);
      return coupons;
    },
  
    // 透過 user ID 取得他所擁有的優惠券
    getById: async (id,code) => {
      let query = `
            SELECT *, cr.id FROM coupons_records cr 
            LEFT JOIN coupons c ON cr.coupon_id = c.id 
            WHERE user_id = ?
            ORDER BY cr.id DESC`;

      let params = [id]; // 先加上 user_id

      if (code) { 
        query += ` AND c.code = ? AND cr.status = "未使用" LIMIT 1`;
        params.push(code); // 如果 code 存在才加到參數
      }

      const [result] = await db.query(query, params);
      
      return result.length ? result : [];
    }, 

    // 新增會員優惠券
    create: async (user_id, coupon_id, draw_date) => {
        const [result] = await db.query(
        `INSERT INTO coupons_records (user_id, coupon_id, draw_date ) VALUES (?, ?, ?)`,
        [user_id, coupon_id, draw_date]
        );
    return result.insertId;
  },
};
  
export default Coupon;