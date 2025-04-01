import db from "../config/database.js";

const Reserve = {
  // 透過 ID 取得會員
  //   getById: async (id) => {
  //     const [result] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [id]);
  //     return result.length ? result[0] : null;
  //   },

  // 新增訂位資料
  create: async (
    customer_name,
    customer_phone,
    reservation_date,
    number_of_people,
    table_id,
    user_id
  ) => {
    const [result] = await db.query(
      `INSERT INTO reservations (customer_name, customer_phone, reservation_date, number_of_people, table_id, user_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        customer_name,
        customer_phone,
        reservation_date,
        number_of_people,
        table_id,
        user_id,
      ]
    );
    return result.insertId;
  },

  getResTables: async (date) => {
    const [result] = await db.query(
      `
        SELECT * FROM reservations r
        JOIN tables t ON r.table_id = t.table_id
        WHERE r.reservation_date = ? AND status = "已預約"
    `,
      [date]
    );

    if (!result || result.length === 0) {
      return null;
    }

    return result;
  },

  getTables: async () => {
    const [result] = await db.query(`
        SELECT * FROM tables;
    `);

    if (!result || result.length === 0) {
      return null;
    }

    return result;
  },

  getUserRes: async (user_id) => {
    const [result] = await db.query(
      `
      SELECT * FROM reservations r
      JOIN tables t ON r.table_id = t.table_id
      WHERE r.user_id = ?
      ORDER BY r.reservation_date ASC
  `,
      [user_id]
    );

    return result;
  },
  // 更新預約狀態
  update: async (status, reservation_id) => {
    const [result] = await db.query(
      `UPDATE reservations SET status = ? WHERE reservation_id = ?`,
      [status, reservation_id]
    );
    return result.affectedRows > 0;
  },
};

export default Reserve;
