import Reserve from "../models/reserveModel.js";

// 新增預約資料
export const createReserve = async (req, res) => {
  const { customer_name, customer_phone, reservation_date, number_of_people, table_id, user_id } = req.body;
  if (!customer_name || !customer_phone || !reservation_date || !number_of_people || !table_id || !user_id)
    return res.status(400).json({ error: "所有欄位為不可為空" });

  try {
    const insertId = await Reserve.create(customer_name, customer_phone, reservation_date, number_of_people, table_id, user_id);

    // 檢查插入的訂單是否成功，並且 order_id 是否有效
    if (!insertId) {
      return res.status(500).json({ error: "預約資料建立失敗" });
    }

    res.status(201).json({
      message: "預約建立成功",
      Reserve: { id:insertId, customer_name, customer_phone, reservation_date, number_of_people, table_id, user_id}
    });
  } catch (err) {
      console.error("後端錯誤:", err);
    // 錯誤處理
    res.status(500).json({ error: "預約資料建立失敗", detail: err.message });
  }
};

//獲取當天已訂位的桌子
export const getReserveTables = async (req, res)=>{
    try {
 
        
        const tables = await Reserve.getResTables(req.params.date);

    // 查詢結果為空時，返回一個空陣列
    if (!tables || tables.length === 0) {
      return res.json({ message: "當天沒有已預約的桌子", tables: [] });
    }

    // 返回已預約的桌子資料
    res.json({ message: "被預約的座位取得成功", tables });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

//取得所有座位
export const getAllTables = async (req, res)=>{
    try {
        
        
        const tables = await Reserve.getTables();

    // 查詢結果為空時，返回一個空陣列
    if (!tables || tables.length === 0) {
      return res.json({ message: "找無桌子", tables: [] });
    }

    // 返回已預約的桌子資料
    res.json({ message: "所有座位取得成功", tables });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};

//取得會員預約資料
export const getUserReserve = async (req, res)=>{
    try {
      const { id } = req.params;
      if (id) {
        const userRes = await Reserve.getUserRes(id);
        if (!userRes) {
          return res.status(404).json({ error: "沒有預約資料" });
        }
        return res.json({ message: "預約資料取得成功", userRes });
      }
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
};
