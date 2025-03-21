import db from "../config/database.js";

const Order = {
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
  update: async (order_id, status) => {
    const [result] = await db.query(
      `UPDATE orders SET status = ? WHERE order_id = ?`,
      [order_id, status]
    );
    return result.affectedRows > 0;
  },
};

export default Order;
