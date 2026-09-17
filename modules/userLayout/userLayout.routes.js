
const auth = require("../../middlewares/auth.middleware");
const express = require("express");
const router = express.Router();
const userController = require("./userLayout.controller")
//user-assign layout

router.get("/user-layout/:source", auth, userController.getAssignedLayout);
module.exports = router;