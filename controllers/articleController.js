import Article from "../models/articleModel.js";

// 取得文章資料（含搜尋與分頁）
export const getArticles = async (req, res) => {
    const { keyword = "", page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const searchValue = keyword ? `%${keyword}%` : null;
  
    try {
      const articles = await Article.getAll(searchValue, limit, offset);
      const totalRecords = await Article.getTotalCount(searchValue);
      const totalPages = Math.ceil(totalRecords / limit);
  
      res.json({ articles, page, totalPages, totalRecords });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  // 取得單一文章
  export const getArticleById = async (req, res) => {
    try {
      const article = await Article.getById(req.params.id);
      if (!article) return res.status(404).json({ error: "這篇文章不存在" });
      res.json({ message: "文章資料取得成功", article });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };