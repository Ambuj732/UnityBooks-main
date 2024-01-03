const express = require('express');
const getDataController = require('../controllers/getData');

const router = express.Router();

//routes

router.get('/products', getDataController.products);
router.get('/categories', getDataController.categories);
router.get('/authors', getDataController.authors);
router.get('/coupons', getDataController.coupons);
router.post('/prodcat', getDataController.prodcat);
router.post('/search', getDataController.search);
router.get('/address', getDataController.address);

module.exports = router;