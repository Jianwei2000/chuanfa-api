import db from "../config/database.js";

const Product = {
  // 取得所有商品（含搜尋、分類、載入更多）
  getAll: async (category, limit, offset, sortBy) => {
    const categoryQuery = category ? `WHERE category = ?` : "";
    const params = [];

    if (category) params.push(category);

    // 加入排序條件
    let orderBy = "ORDER BY products.product_id DESC"; // 預設是根據商品 ID 降冪排列（最新）

    if (sortBy === "latest") {
      orderBy = "ORDER BY products.create_time DESC";
    } else if (sortBy === "price_desc") {
      orderBy = "ORDER BY products.price DESC"; // 價格從高到低排序
    } else if (sortBy === "price_asc") {
      orderBy = "ORDER BY products.price ASC"; // 價格從低到高排序
    }

    params.push(Number(limit)); // 限制每次載入的數量
    params.push(Number(offset)); // 偏移量，用於載入更多

    const [products] = await db.query(
      `SELECT *, products.product_id FROM products
        LEFT JOIN product_images ON product_images.product_id = products.product_id 
        ${categoryQuery}
        AND (product_images.is_main = 1 OR product_images.product_id IS NULL) 
        ${orderBy}
        LIMIT ? OFFSET ?`,
      params
    );

    return products;
  },

  // 取得商品總數
  getTotalCount: async (category) => {
    const categoryQuery = category ? `WHERE category = ?` : "";
    const params = [];

    if (category) params.push(category);

    const [result] = await db.query(
      `SELECT COUNT(*) as total FROM products ${categoryQuery}`,
      params
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

  //取得商品所有圖片
  getImages: async (id) => {
    const [images] = await db.query(
      `
        SELECT *  FROM product_images
        WHERE  product_id = ?`,
      [id]
    );
    return images;
  },
};

export default Product;
