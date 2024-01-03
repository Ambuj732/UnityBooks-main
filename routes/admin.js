const express = require('express');
const path = require('path');
const adminController = require('../controllers/admin');

const router = express.Router();
let staticPath = path.join(__dirname, "../views");  // good practice - building

//routes-Bookstore
router.get('/signin', (req, res) => {
	res.sendFile(path.join(staticPath, "./adminLogin.html"));
});

router.post('/login', adminController.login); // building.hotel

router.get(['/', '/dashboard'], adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminDashboard.html"));
}); // club-vip lonuge-HongKong

router.get('/inventory', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminInventory.html"));
});

router.get('/products', adminController.products); // on line store books

router.post('/product', adminController.product);

router.get('/inventoryAddProduct', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminInventoryAddProduct.html"));
});

router.get('/inventoryViewProduct', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminInventoryViewProduct.html"));
});

router.post('/editProduct', adminController.editProduct);

router.post('/addProduct', adminController.addProduct);

router.get('/shop', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminShop.html"));
});

router.get('/shopCheckout', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminCheckout.html"));
});

router.get('/orders', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminOrders.html"));
});

router.get('/order', adminController.order);

router.get('/orderDetails', adminController.isLoggedIn, (req, res) => {
	res.sendFile(path.join(staticPath, "./adminOrderDetails.html"));
});

router.get('/signout', adminController.signout);

module.exports = router;