const express = require("express");

const router = express.Router();

const auth = require("../..//middlewares/auth.middleware");
const validator = require("../../middlewares/validate.middleware");

const controller = require("./layout.controller");
const {
  createLayoutSchema,
  updateLayoutSchema,
} = require("./layout.validation");
// layout metadata

// layout
router.post("/", auth, validator(createLayoutSchema), controller.createLayout);
router.get("/", auth, controller.getAllLayouts);

router.get("/column/:source", auth, controller.getColumns);
router.get("/resolve/:source", auth, controller.getDefaultLayout);
router.get("/getData", auth, controller.getInventory);

router.get("/:id", auth, controller.getOneLayout);
router.patch(
  "/:id",
  auth,
  validator(updateLayoutSchema ),
  controller.updateLayout,
);
router.delete("/:id", auth, controller.deleteLayout);

module.exports = router;
