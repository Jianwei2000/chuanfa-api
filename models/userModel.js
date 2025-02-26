import db from "../config/database.js";

const User = {
  // 取得所有會員（含搜尋、分頁）
  getAll: async (keyword, limit, offset) => {
    const searchQuery = keyword ? `WHERE user_name LIKE ?` : "";
    const params = keyword ? [keyword, Number(limit), Number(offset)] : [Number(limit), Number(offset)];
    const [users] = await db.query(`SELECT * FROM users ${searchQuery} ORDER BY user_id DESC LIMIT ? OFFSET ?`, params);
    return users;
  },

  // 取得會員總數
  getTotalCount: async (keyword) => {
    const searchQuery = keyword ? `WHERE user_name LIKE ?` : "";
    const [result] = await db.query(`SELECT COUNT(*) as total FROM users ${searchQuery}`, keyword ? [keyword] : []);
    return result[0].total;
  },

  // 透過 ID 取得會員
  getById: async (id) => {
    const [result] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [id]);
    return result.length ? result[0] : null;
  },

  // 新增會員
  create: async (name, email, passwordHash, mobile, address, birthday) => {
    const [result] = await db.query(
      `INSERT INTO users (user_name, email, password_hash, phone_number, address, birthday) VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, passwordHash, mobile, address, birthday]
    );
    return result.insertId;
  },

  // 更新會員資料
  update: async (id, name, email, mobile, birthday, address) => {
    const [result] = await db.query(
      `UPDATE users SET user_name = ?, email = ?, phone_number = ?, address = ?, birthday = ? WHERE user_id = ?`,
      [name, email, mobile, address || "", birthday || null, id]
    );
    return result.affectedRows > 0;
  },

  // 刪除會員
  delete: async (id) => {
    await db.query(`DELETE FROM users WHERE user_id = ?`, [id]);
  }
};

export default User;
