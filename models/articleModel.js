import db from "../config/database.js";

const Article = {
    // 取得所有文章（含搜尋、分頁）
    getAll: async (keyword, limit, offset) => {
      const searchQuery = keyword ? `WHERE title LIKE ?` : "";
      const params = keyword ? [keyword, Number(limit), Number(offset)] : [Number(limit), Number(offset)];
      const [articles] = await db.query(`SELECT * FROM articles ${searchQuery} ORDER BY article_id DESC LIMIT ? OFFSET ?`, params);
      return articles;
    },
  
    // 取得文章總數
    getTotalCount: async (keyword) => {
      const searchQuery = keyword ? `WHERE title LIKE ?` : "";
      const [result] = await db.query(`SELECT COUNT(*) as total FROM articles ${searchQuery}`, keyword ? [keyword] : []);
      return result[0].total;
    },
  
    // 透過 ID 取得文章
    getById: async (id) => {
      const [result] = await db.query(`SELECT * FROM articles WHERE article_id = ?`, [id]);
      return result.length ? result[0] : null;
    }, 
};
  
export default Article;