const express = require('express');
const apiController = require('../controllers/api');

const router = express.Router();

// Import the getUID function from the apiController
const { getUID } = apiController;

//routes

router.post('/addToCart', apiController.addToCart);
router.get('/getCart', apiController.getCart);

module.exports = router;