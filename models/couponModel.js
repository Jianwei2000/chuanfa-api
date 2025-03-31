import db from "../config/database.js";

const Coupon = {
    // 取得所有優惠券
    getAll: async () => {
      const [coupons] = await db.query(`SELECT * FROM coupons`);
      return coupons;
    },
  
    // 透過 user ID 取得他所擁有的優惠券
    getById: async (id, code) => {
      let query = `
          SELECT *, cr.id FROM coupons_records cr 
          LEFT JOIN coupons c ON cr.coupon_id = c.id 
          WHERE cr.user_id = ?`; // 確保 WHERE 結尾正確
  
      let params = [id];
  
      if (code) { 
          query += ` AND c.code = ? AND cr.status = '未使用'`;
          params.push(code);
      }
  
      query += ` ORDER BY cr.id DESC LIMIT 1`; // 確保 ORDER BY 在 WHERE 之後
  
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