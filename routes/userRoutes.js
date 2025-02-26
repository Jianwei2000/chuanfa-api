import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers); // 取得會員資料（含搜尋、分頁）
router.get("/:id", getUserById); // 取得單一會員資料
router.post("/", createUser); // 新增會員
router.put("/:id", updateUser); // 修改會員
router.delete("/:id", deleteUser); // 刪除會員

export default router;
