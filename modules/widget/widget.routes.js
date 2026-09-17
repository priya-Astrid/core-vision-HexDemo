const express = require("express");
const router = express.Router();
const controller = require("./widget.controller");
const validator = require("../../middlewares/validate.middleware");
const {
  createWidgetSchema,
  updateWidgetSchema,
} = require("./widget.validation");
const auth = require("../../middlewares/auth.middleware");

router.post("/", auth, validator(createWidgetSchema), controller.createWidget);
router.get("/", auth, controller.getAllWidgets);
// router.get("/status",auth, controller.widgetStatus);
router.get("/:id", auth, controller.getWidgetById);
router.patch(
  "/:id",
  auth,
  validator(updateWidgetSchema),
  controller.updateWidget,
);
router.patch("/:id/status",auth, controller.updateWidgetStatus)
router.delete("/:id", auth, controller.deleteWidget);
module.exports = router;
