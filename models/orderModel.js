import db from "../config/database.js";

const Order = {
  //訂單ID取得所有資料
  getById: async(id)=>{

    const [result] = await db.query(`
      SELECT o.*, od.* ,u.*
      FROM orders o
      INNER JOIN order_details od ON o.order_id = od.order_id
      INNER JOIN users u ON o.user_id = u.user_id 
      WHERE o.order_id = ? ;`, [id]);
      return result.length ? result[0] : null;
  },

  //訂單ID取得購買的商品
  getProducts: async(id)=>{
    const [result] = await db.query(`
      SELECT p.*
      FROM order_details od
      INNER JOIN orders o ON od.order_id = o.order_id
      INNER JOIN products p ON od.product_id = p.product_id
      WHERE o.order_id = ?;`, [id]);
      return result.length ? result : []; 
  },

  // 新增訂單
  create: async (
    order_id,
    user_id,
    total_amount,
    status,
    shipping_address,
    shipOption,
    payOption,
    recipientName,
    recipientPhone
  ) => {
    const [result] = await db.query(
      `INSERT INTO orders (order_id, user_id, total_amount, status, shipping_address, shipOption, payOption, recipientName, recipientPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        user_id,
        total_amount,
        status,
        shipping_address,
        shipOption,
        payOption,
        recipientName,
        recipientPhone,
      ]
    );

    if (result) {
      return order_id;
    }
  },

  // 新增訂單明細
  addDetail: async (order_id, products) => {
    // 假設 products 是一個數組，包含多個產品的資料
    const values = products.map((product) => [
      order_id,
      product.product_id,
      product.count,
      product.price,
    ]);

    const [result] = await db.query(
      `INSERT INTO order_details (order_id, product_id, quantity, unit_price) VALUES ?`,
      [values]
    );
    return result.affectedRows;
  },

  // 更新訂單狀態
  update: async ( status, order_id) => {
    const [result] = await db.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [status, order_id]
    );
    return result.affectedRows > 0;
  },
};

export default Order;
