import Order from "../models/orderModel.js";

// 建立訂單包含明細
export const createOrder = async (req, res) => {
    const { order_id, user_id, total_amount, status,shipping_address, products , shipOption,payOption,recipientName, recipientPhone} = req.body;
  
    // 檢查必要欄位
    if (!order_id || !user_id || !total_amount || !products || products.length === 0) {
      return res.status(400).json({ error: "必須要有 訂單ID、會員ID、總金額，以及至少一個商品明細" });
    }
  
    try {
      // 插入訂單並獲得 order_id
      const insertId = await Order.create(order_id, user_id, total_amount, status ,shipping_address, shipOption,payOption,recipientName, recipientPhone);
  
      // 檢查插入的訂單是否成功，並且 order_id 是否有效
      if (!insertId) {
        return res.status(500).json({ error: "訂單建立失敗，無法獲取訂單ID" });
      }
  
      // 新增訂單明細
      await Order.addDetail(insertId, products);
  
      // 返回訂單建立成功的響應
      res.status(201).json({
        message: "訂單建立成功",
        order: { id: insertId, user_id, total_amount, status, shipping_address, products }
      });
    } catch (err) {
        console.error("後端錯誤:", err);
      // 錯誤處理
      res.status(500).json({ error: "訂單建立失敗", detail: err.message });
    }
  };