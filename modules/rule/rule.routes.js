const express = require("express");
const router = express.Router();

const controller = require("./rule.controller");
const auth = require("../../middlewares/auth.middleware");
const validator = require("../../middlewares/validate.middleware");

const { createRuleSchema } = require("./rule.validation");


router.post(
    "/",
    auth,
    validator(createRuleSchema),
    controller.create
);

router.get(
    "/",
    auth,
    controller.getAll
);

router.get(
    "/:id",
    auth,
    controller.getById
);

router.patch(
    "/:id",
    auth,
    controller.update
);

router.delete(
    "/:id",
    auth,
    controller.delete
);

router.patch(
    "/:id/enable",
    auth,
    controller.enable
);

router.patch(
    "/:id/disable",
    auth,
    controller.disable
);

module.exports = router;