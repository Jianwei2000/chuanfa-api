import Product from "../models/productModel.js";

// 取得商品資料（含搜尋與分頁）
export const getProducts = async (req, res) => {
  const { keyword = "", page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;
  const searchValue = keyword ? `%${keyword}%` : null;

  try {
    const products = await Product.getAll(searchValue, limit, offset);
    const totalRecords = await Product.getTotalCount(searchValue);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({ products, page, totalPages, totalRecords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 取得單一商品
export const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ error: "商品不存在" });
    res.json({ message: "商品資料取得成功", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 取得商品圖
export const getProductImages = async (req, res) => {
  try {
    const product = await Product.getImages(req.params.id);
    if (!product) return res.status(404).json({ error: "圖片不存在" });
    res.json({ message: "商品圖片取得成功", product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};