const express = require('express');
const router = express.Router();
const controller = require('./auth.controller');
const Validator = require('../../middlewares/validate.middleware');
const { createUserSchema } = require('../user/user.validation');

router.post('/register', Validator(createUserSchema), controller.register);
router.post('/login', controller.login);

module.exports = router;