const express = require('express');
const router = express.Router();
const { getCart, saveCart, clearCart } = require('../controllers/cartController');
const auth = require('../middleware/auth');

// All cart routes require authentication
router.use(auth);

// @route   GET /api/cart
// @desc    Get user's saved cart
// @access  Private
router.get('/', getCart);

// @route   POST /api/cart/save
// @desc    Save user's cart
// @access  Private
router.post('/save', saveCart);

// @route   POST /api/cart/clear
// @desc    Clear user's cart
// @access  Private
router.post('/clear', clearCart);

module.exports = router;
