const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth.middleware")
const userWidgetController = require("./userWidget.controller");

router.post("/", auth, userWidgetController.createUserWidget);
router.get("/", auth, userWidgetController.getUserWidget);
router.patch(
  "/:widgetId/position",
  auth,
  userWidgetController.updateWidgetPosition,
);
router.delete("/:widgetId", auth, userWidgetController.removeWidget);
module.exports = router;
