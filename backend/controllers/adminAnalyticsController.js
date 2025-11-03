const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/analytics/summary?days=30&threshold=10
const getSummary = async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const threshold = parseInt(req.query.threshold, 10) || 10;

  const start = new Date();
  start.setDate(start.getDate() - days);

  // Total sales and orders count (exclude cancelled)
  const salesAgg = await Order.aggregate([
    { $match: { createdAt: { $gte: start }, status: { $ne: 'cancelled' } } },
    { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, ordersCount: { $sum: 1 } } },
  ]);

  const totalSales = (salesAgg[0] && salesAgg[0].totalSales) || 0;
  const ordersCount = (salesAgg[0] && salesAgg[0].ordersCount) || 0;

  // Total customers (count of users with role customer)
  const totalCustomers = await User.countDocuments({ role: 'customer' });

  // Low stock count
  const lowStockCount = await Product.countDocuments({ stock: { $lte: threshold }, status: { $ne: 'Inactive' } });

  res.json({
    success: true,
    data: {
      totalSales,
      ordersCount,
      totalCustomers,
      lowStockCount,
      rangeDays: days,
      lowStockThreshold: threshold,
    },
  });
};

// GET /api/admin/analytics/top-products?limit=10&days=90
const getTopProducts = async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const days = parseInt(req.query.days, 10) || 90;

  const start = new Date();
  start.setDate(start.getDate() - days);

  const agg = await Order.aggregate([
    { $match: { createdAt: { $gte: start }, status: { $ne: 'cancelled' } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.product', qtySold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { qtySold: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    { $project: { productId: '$_id', qtySold: 1, revenue: 1, name: '$product.name', image: '$product.image', price: '$product.price' } }
  ]);

  res.json({ success: true, data: agg });
};

// GET /api/admin/analytics/sales-by-day?days=30
const getSalesByDay = async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const start = new Date();
  start.setDate(start.getDate() - days);

  const agg = await Order.aggregate([
    { $match: { createdAt: { $gte: start }, status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalAmount' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ success: true, data: agg });
};

module.exports = { getSummary, getTopProducts, getSalesByDay };
