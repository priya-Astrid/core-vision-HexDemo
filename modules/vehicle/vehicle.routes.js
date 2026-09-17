const express = require("express");
const router = express.Router();

const controller = require("./vehicle.controller");
const auth = require("../../middlewares/auth.middleware");
const validator = require("../../middlewares/validate.middleware");

const { createVehicleSchema } = require("./vehicle.validation");

router.post("/", auth, validator(createVehicleSchema), controller.create);

router.get("/", auth, controller.getAll);

router.get("/:id", auth, controller.getById);

router.patch("/:id", auth, controller.update);

router.patch("/:id/assign-device", auth, controller.assignDevice);

router.patch("/:id/unassign", auth, controller.unassignDevice);

router.delete("/:id", auth, controller.delete);

module.exports = router;
