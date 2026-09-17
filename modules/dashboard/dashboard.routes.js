const express = require("express");
const router = express.Router();
const controller = require("./dashboard.controller");
const auth = require("../../middlewares/auth.middleware");
router.get("/", auth, controller.getDashboard);
router.post("/operations", auth, controller.handleWidget);
module.exports = router;
