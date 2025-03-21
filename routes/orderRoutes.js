import express from "express";
import {
    createOrder
} from "../controllers/orderController.js";

const router = express.Router();


router.post("/", createOrder); // 新增訂單


export default router;