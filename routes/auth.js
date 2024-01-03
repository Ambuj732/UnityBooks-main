const express = require('express');
const authController = require('../controllers/auth');

const router = express.Router();

//routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/code', authController.code);
router.get('/signout', authController.signout);

module.exports = router;