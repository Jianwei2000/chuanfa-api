import express from "express";

import {
    sendOrderMail,
  } from "../controllers/sendmailController.js";
  
  const router = express.Router();
  
  router.post("/ordermail", sendOrderMail); // 發送訂單mail

  
  export default router;