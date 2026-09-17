const express = require('express');
const router = express.Router();
const controller = require('./notification.controller');
const auth = require('../../middlewares/auth.middleware');
const { createNotificationSchema } = require('./notification.validation');
const validator = require("../../middlewares/validate.middleware");

router.post('/', auth,
    validator(createNotificationSchema), controller.create);

router.get("/", auth,
    controller.getAll);

router.get("/:id", auth,
    controller.getById);

router.patch("/:id", auth,
    controller.update);

router.delete("/:id", auth,
    controller.delete);

module.exports = router;