const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getSummary, getTopProducts, getSalesByDay } = require('../controllers/adminAnalyticsController');
const { listStaff, getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');

// All admin analytics routes require auth and admin/staff role
router.get('/analytics/summary', auth, requireRole('admin', 'staff'), getSummary);
router.get('/analytics/top-products', auth, requireRole('admin', 'staff'), getTopProducts);
router.get('/analytics/sales-by-day', auth, requireRole('admin', 'staff'), getSalesByDay);

// Staff management routes (admin only)
router.get('/staff', auth, requireRole('admin'), listStaff);
router.get('/staff/:id', auth, requireRole('admin'), getStaff);
router.post('/staff', auth, requireRole('admin'), createStaff);
router.put('/staff/:id', auth, requireRole('admin'), updateStaff);
router.delete('/staff/:id', auth, requireRole('admin'), deleteStaff);

// recent feedbacks
router.get('/analytics/feedbacks', auth, requireRole('admin', 'staff'), async (req, res) => {
	const Product = require('../models/Product')
	// unwind reviews and return latest 5
	const agg = await Product.aggregate([
		{ $unwind: '$reviews' },
		{ $sort: { 'reviews.createdAt': -1 } },
		{ $limit: 8 },
		{ $project: { productName: '$name', user: '$reviews.userName', comment: '$reviews.comment', rating: '$reviews.rating', createdAt: '$reviews.createdAt' } }
	])
	res.json({ success: true, data: agg })
})

module.exports = router;
