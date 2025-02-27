import db from "../config/database.js";

const Product = {
  // 取得所有商品（含搜尋、分頁）
  getAll: async (keyword, limit, offset) => {
    const searchQuery = keyword ? `WHERE product_name LIKE ?` : "";
    const params = keyword
      ? [keyword, Number(limit), Number(offset)]
      : [Number(limit), Number(offset)];
    const [products] = await db.query(
      `SELECT *, products.product_id FROM products
        LEFT JOIN product_images ON product_images.product_id = products.product_id 
        ${searchQuery}
        AND (product_images.is_main = 1 OR product_images.product_id IS NULL) 
        ORDER BY products.product_id DESC 
        LIMIT ? OFFSET ?`,
      params
    );
    return products;
  },

  // 取得商品總數
  getTotalCount: async (keyword) => {
    const searchQuery = keyword ? `WHERE product_name LIKE ?` : "";
    const [result] = await db.query(
      `SELECT COUNT(*) as total FROM products ${searchQuery}`,
      keyword ? [keyword] : []
    );
    return result[0].total;
  },

  // 透過 ID 取得商品
  getById: async (id) => {
    const [result] = await db.query(
      `
        SELECT *, products.product_id FROM products
        LEFT JOIN product_images ON product_images.product_id = products.product_id
        WHERE  products.product_id = ?`,
      [id]
    );
    return result.length ? result[0] : null;
  },
};

export default Product;
