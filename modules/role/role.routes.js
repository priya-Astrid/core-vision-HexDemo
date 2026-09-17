const express = require('express');
const router = express.Router();
const controller = require('./role.controller');
const auth = require('../../middlewares/auth.middleware');

router.post('/', controller.create);
router.get('/', auth, controller.getAll);

module.exports = router;