const express = require('express');
const setDataController = require('../controllers/setData');

const router = express.Router();

//routes

router.post('/address', setDataController.address);
router.get('/checkCoupons', setDataController.checkCoupons);

module.exports = router;