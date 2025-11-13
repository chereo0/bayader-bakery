const Order = require('../models/Order');
const ProductionQueue = require('../models/ProductionQueue');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get dashboard statistics for staff
exports.getDashboardStats = async (req, res) => {
  try {
    // Calculate new orders (pending and confirmed status)
    const newOrdersCount = await Order.countDocuments({
      status: { $in: ['pending', 'confirmed'] }
    });

    // Calculate orders in production (preparing status)
    const inProductionCount = await Order.countDocuments({
      status: 'preparing'
    });

    // Calculate ready for dispatch (out-for-delivery ready to be picked up)
    const readyForDispatchCount = await Order.countDocuments({
      status: 'out-for-delivery'
    });

    // Get production queue counts
    const productionQueueStats = await ProductionQueue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const productionByStatus = {};
    productionQueueStats.forEach(stat => {
      productionByStatus[stat._id] = stat.count;
    });

    // Calculate 6-point trend for new orders (last 6 days/periods)
    const orderTrendData = await Order.aggregate([
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 6 }
    ]);

    // Reverse to show chronological order
    const orderTrend = orderTrendData.reverse().map(d => d.count);
    // Pad with zeros if less than 6 points
    while (orderTrend.length < 6) {
      orderTrend.unshift(0);
    }

    // Calculate 6-point trend for production items
    const productionTrendData = await ProductionQueue.aggregate([
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 6 }
    ]);

    const productionTrend = productionTrendData.reverse().map(d => d.count);
    while (productionTrend.length < 6) {
      productionTrend.unshift(0);
    }

    // Get recent notifications/alerts
    const lowStockAlerts = await Order.aggregate([
      { $match: { status: 'pending' } },
      { $limit: 3 }
    ]);

    logger.info('Dashboard statistics calculated', {
      newOrders: newOrdersCount,
      inProduction: inProductionCount,
      readyForDispatch: readyForDispatchCount
    });

    res.json({
      success: true,
      data: {
        summary: {
          newOrders: newOrdersCount,
          inProduction: inProductionCount,
          readyForDispatch: readyForDispatchCount
        },
        trends: {
          orders: orderTrend,
          production: productionTrend
        },
        production: productionByStatus,
        alerts: lowStockAlerts.slice(0, 3)
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get quick overview data
exports.getQuickOverview = async (req, res) => {
  try {
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const productionByStatus = await ProductionQueue.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusBreakdown = {};
    ordersByStatus.forEach(s => {
      statusBreakdown[s._id] = s.count;
    });

    const productionBreakdown = {};
    productionByStatus.forEach(s => {
      productionBreakdown[s._id] = s.count;
    });

    res.json({
      success: true,
      data: {
        orders: statusBreakdown,
        production: productionBreakdown
      }
    });
  } catch (error) {
    logger.error('Error fetching quick overview', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get staff performance metrics
exports.getPerformanceMetrics = async (req, res) => {
  try {
    // Total orders processed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersProcessedToday = await Order.countDocuments({
      createdAt: { $gte: today },
      status: { $in: ['delivered', 'out-for-delivery'] }
    });

    // Average order processing time
    const processingTimeData = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $project: {
          processingTime: {
            $subtract: [new Date(), '$createdAt']
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$processingTime' }
        }
      }
    ]);

    const avgProcessingTime = processingTimeData.length > 0 
      ? Math.round(processingTimeData[0].avgTime / (1000 * 60 * 60)) // Convert to hours
      : 0;

    // Production queue depth
    const queueDepth = await ProductionQueue.countDocuments({
      status: { $in: ['pending', 'baking', 'decorating', 'quality_check'] }
    });

    logger.info('Performance metrics calculated', {
      ordersProcessedToday,
      avgProcessingTime,
      queueDepth
    });

    res.json({
      success: true,
      data: {
        ordersProcessedToday,
        avgProcessingTimeHours: avgProcessingTime,
        productionQueueDepth: queueDepth
      }
    });
  } catch (error) {
    logger.error('Error fetching performance metrics', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
