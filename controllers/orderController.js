import Order from "../models/orderModel.js";

// 建立訂單包含明細
export const createOrder = async (req, res) => {
  const {
    order_id,
    user_id,
    total_amount,
    status,
    shipping_address,
    products,
    shipOption,
    payOption,
    recipientName,
    recipientPhone,
  } = req.body;

  // 檢查必要欄位
  if (
    !order_id ||
    !user_id ||
    !total_amount ||
    !products ||
    products.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "必須要有 訂單ID、會員ID、總金額，以及至少一個商品明細" });
  }

  try {
    // 插入訂單並獲得 order_id
    const insertId = await Order.create(
      order_id,
      user_id,
      total_amount,
      status,
      shipping_address,
      shipOption,
      payOption,
      recipientName,
      recipientPhone
    );

    // 檢查插入的訂單是否成功，並且 order_id 是否有效
    if (!insertId) {
      return res.status(500).json({ error: "訂單建立失敗，無法獲取訂單ID" });
    }

    // 新增訂單明細
    await Order.addDetail(insertId, products);

    // 返回訂單建立成功的響應
    res.status(201).json({
      message: "訂單建立成功",
      order: {
        id: insertId,
        user_id,
        total_amount,
        status,
        shipping_address,
        products,
      },
    });
  } catch (err) {
    console.error("後端錯誤:", err);
    // 錯誤處理
    res.status(500).json({ error: "訂單建立失敗", detail: err.message });
  }
};

// ID取得訂單所有資料
export const getOrderById = async (req, res) => {
  try {
    const { order_id, user_id } = req.params;

    // 如果是查詢訂單資料
    if (order_id) {
      const order = await Order.getById(order_id, false);
      if (!order) {
        return res.status(404).json({ error: "訂單不存在" });
      }
      return res.json({ message: "訂單資料取得成功", order });
    }

    // 如果是查詢該使用者的所有訂單
    if (user_id) {
      // 根據 user_id 查詢所有訂單
      const orders = await Order.getById(user_id, true);  // 查詢使用者的所有訂單
      if (orders.length === 0) {
        return res.status(404).json({ error: "該使用者沒有訂單" });
      }
      return res.json({ message: "使用者訂單資料取得成功", orders });
    }

    // 若未傳遞 order_id 或 user_id，回傳錯誤
    return res.status(400).json({ error: "缺少 order_id 或 user_id" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//訂單ID取得購買的商品
export const getProductsById = async (req, res) => {
  try {
    const orderProducts = await Order.getProducts(req.params.id);
    if (!orderProducts) return res.status(404).json({ error: "找無資料" });
    res.json({ message: "購買的商品資料取得成功", orderProducts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order_id = req.params.id;
  if (!status || !order_id) {
    return res.status(400).json({ error: "請提供要修改的訂單ID和狀態" });
  }

  try {
    const success = await Order.update(status, order_id);
    if (success)
      res.json({ message: "訂單更新成功", order: { status, order_id } });
    else res.status(400).json({ error: "訂單資料未更新" });
  } catch (err) {
    res.status(500).json({ error: "修改訂單失敗", detail: err.message });
  }
};
