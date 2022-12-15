const express = require('express');
const { getUserCart, addToCart } = require('../controllers/cart.controller');
const router = express.Router();

router.route('/list').get(getUserCart);
router.route('/add').post(addToCart);

module.exports = router;