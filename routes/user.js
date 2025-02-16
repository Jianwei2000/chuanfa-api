import express from "express";
import moment from "moment-timezone";
import db from "../utils/db_connect.js";

const router = express.Router();

router.get("/", async (req, res) => {

});

router.get("/add", async (req, res) => {
    res.render("add-user")
});



export default router;