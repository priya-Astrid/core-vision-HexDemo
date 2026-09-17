const express = require("express");
const router = express.Router();
const controller = require("./organization.controller");
const auth = require("../../middlewares/auth.middleware");
const validator = require("../../middlewares/validate.middleware");
const { organizationSchema, updateOrgSchema } = require("./organization.validation");

router.post("/", auth,validator(organizationSchema), controller.create);
router.get("/", auth, controller.getAll);
router.patch("/:id", auth,validator(updateOrgSchema), controller.update);
router.delete("/:id", auth, controller.delete)
module.exports = router;
