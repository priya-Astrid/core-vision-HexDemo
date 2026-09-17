const express = require("express");
const router = express.Router();
const controller = require("./device.controller");
const auth = require("../../middlewares/auth.middleware");
const validator = require("../../middlewares/validate.middleware");
const {
  createDeviceSchema,
  updateDeviceSchema,
  paginationSchema,
} = require("./device.validation");

router.post("/", auth, validator(createDeviceSchema), controller.createDevice);
router.get(
  "/",
  auth,
  validator(paginationSchema, "query"),
  controller.getAllDevices,
);
router.get("/online-imeis", auth, controller.getonlineImei)
router.get("/:id", auth, controller.getDeviceById);
router.patch(
  "/:id",
  auth,
  validator(updateDeviceSchema),
  controller.updateDevice,
);
router.delete("/:id", auth, controller.deleteDevice);
module.exports = router;
