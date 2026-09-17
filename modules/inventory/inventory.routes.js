const express = require("express");
const router = express.Router();
const controller = require("./inventory.controller");
const auth = require("../../middlewares/auth.middleware");
const Validator = require("../../middlewares/validate.middleware");
const {
  createInventorySchema,
  updateInventorySchema,
} = require("./inventory.validation");

router.post(
  "/",
  auth,
  Validator(createInventorySchema),
  controller.createInventory,
);
router.get("/", auth, controller.getAllInventory);

router.get("/filters", auth, controller.getInventoryFilter);

router.get("/:id", auth, controller.getInventoryById);
router.patch("/:id/device", auth, controller.assignDevice);
router.patch(
  "/:id",
  auth,
  Validator(updateInventorySchema),
  controller.updateInventory,
);
router.delete("/:id", auth, controller.deleteInventory);
module.exports = router;
