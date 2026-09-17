const express = require('express');
const router = express.Router();
const controller = require('./user.controller');
const auth = require('../../middlewares/auth.middleware');
const Validator = require('../../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema } = require('./user.validation');
const { resolveRole } = require('../../middlewares/resolveRole');

router.post('/', auth,resolveRole, Validator(createUserSchema), controller.create);

router.get('/', auth, controller.getAll);
router.get('/:id', auth, controller.getById);
router.patch("/:id", auth,Validator(updateUserSchema), controller.update);
router.delete("/:id",auth, controller.delete )
module.exports = router;