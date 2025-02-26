import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

// 取得會員資料（含搜尋與分頁）
export const getUsers = async (req, res) => {
  const { keyword = "", page = 1, limit = 15 } = req.query;
  const offset = (page - 1) * limit;
  const searchValue = keyword ? `%${keyword}%` : null;

  try {
    const users = await User.getAll(searchValue, limit, offset);
    const totalRecords = await User.getTotalCount(searchValue);
    const totalPages = Math.ceil(totalRecords / limit);

    res.json({ users, page, totalPages, totalRecords });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 取得單一會員
export const getUserById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) return res.status(404).json({ error: "會員不存在" });
    res.json({ message: "會員資料取得成功", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 新增會員
export const createUser = async (req, res) => {
  const { name, email, password, mobile, birthday = null, address = "" } = req.body;
  if (!name || !email || !password || !mobile)
    return res.status(400).json({ error: "姓名，信箱，密碼，手機 為必填" });

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await User.create(name, email, passwordHash, mobile, address, birthday);

    res.status(201).json({ message: "會員新增成功", user: { id: userId, name, email, mobile, birthday, address } });
  } catch (err) {
    res.status(500).json({ error: "新增會員失敗", detail: err.message });
  }
};

// 修改會員
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { user_name: name, email, phone_number: mobile, birthday, address } = req.body;
  if (!name || !email || !mobile)
    return res.status(400).json({ error: "請提供完整的會員資料" });

  try {
    const userExists = await User.getById(id);
    if (!userExists) return res.status(404).json({ error: "找不到該會員" });

    const success = await User.update(id, name, email, mobile, birthday, address);
    if (success)
      res.json({ message: "會員資料更新成功", user: { id, name, email, mobile, birthday, address } });
    else res.status(400).json({ error: "會員資料未更新" });
  } catch (err) {
    res.status(500).json({ error: "修改會員失敗", detail: err.message });
  }
};

// 刪除會員
export const deleteUser = async (req, res) => {
  try {
    const userExists = await User.getById(req.params.id);
    if (!userExists) return res.status(404).json({ error: "會員不存在" });

    await User.delete(req.params.id);
    res.json({ message: "會員刪除成功" });
  } catch (err) {
    res.status(500).json({ error: "刪除會員失敗", detail: err.message });
  }
};
