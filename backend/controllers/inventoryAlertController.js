const InventoryAlert = require('../models/InventoryAlert');
const Product = require('../models/Product');

// GET /api/inventory-alerts - Get all active alerts with pagination
const getAlerts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const status = req.query.status || 'active';
    const priority = req.query.priority;

    const filter = { status };
    if (priority) filter.priority = priority;

    const total = await InventoryAlert.countDocuments(filter);
    const alerts = await InventoryAlert.find(filter)
      .populate('product', 'name category stock')
      .populate('reportedBy', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      data: alerts,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        critical: await InventoryAlert.countDocuments({ ...filter, priority: 'critical' }),
        warning: await InventoryAlert.countDocuments({ ...filter, priority: 'warning' })
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory-alerts/summary - Get alert summary statistics
const getAlertsSummary = async (req, res) => {
  try {
    const activeAlerts = await InventoryAlert.countDocuments({ status: 'active' });
    const critical = await InventoryAlert.countDocuments({ status: 'active', priority: 'critical' });
    const warning = await InventoryAlert.countDocuments({ status: 'active', priority: 'warning' });
    const lowStock = await InventoryAlert.countDocuments({ status: 'active', priority: 'low' });

    res.json({
      success: true,
      data: {
        total: activeAlerts,
        critical,
        warning,
        low: lowStock
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory-alerts - Create new alert
const createAlert = async (req, res) => {
  try {
    const { productId, currentStock, threshold, priority } = req.body;

    if (!productId || currentStock === undefined || !threshold || !priority) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if active alert already exists
    const existingAlert = await InventoryAlert.findOne({
      product: productId,
      status: 'active'
    });

    if (existingAlert) {
      return res.status(400).json({ success: false, message: 'Active alert already exists for this product' });
    }

    const alert = new InventoryAlert({
      product: productId,
      productName: product.name,
      category: product.category,
      currentStock,
      threshold,
      priority,
      reportedBy: req.user?.id
    });

    await alert.save();
    await alert.populate('product', 'name category stock');

    res.status(201).json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/inventory-alerts/:id/resolve - Resolve an alert
const resolveAlert = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;
    const { id } = req.params;

    const alert = await InventoryAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'resolved';
    alert.resolutionNotes = resolutionNotes || '';
    alert.resolvedAt = new Date();
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/inventory-alerts/:id/acknowledge - Acknowledge an alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await InventoryAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = 'acknowledged';
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory-alerts/:id/request-replenishment - Request stock replenishment
const requestReplenishment = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await InventoryAlert.findById(id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.replenishmentRequested = true;
    alert.replenishmentRequestedAt = new Date();
    alert.replenishmentRequestedBy = req.user?.id;
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Replenishment request sent successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/inventory-alerts/report/export - Export alert report
const exportReport = async (req, res) => {
  try {
    const alerts = await InventoryAlert.find({ status: 'active' })
      .populate('product', 'name category')
      .sort({ priority: -1 })
      .lean();

    // Format for CSV export
    const csv = [
      ['Product Name', 'Category', 'Current Stock', 'Threshold', 'Priority', 'Created Date'].join(',')
    ];

    alerts.forEach(alert => {
      csv.push([
        alert.productName,
        alert.category,
        alert.currentStock,
        alert.threshold,
        alert.priority.toUpperCase(),
        new Date(alert.createdAt).toLocaleDateString()
      ].join(','));
    });

    const csvContent = csv.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-alerts.csv');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/inventory-alerts/sync - Sync alerts from current product stock levels
const syncAlertsFromProducts = async (req, res) => {
  try {
    const LOW_STOCK_THRESHOLD = 10;
    const WARNING_THRESHOLD = 20;

    // Find products with low stock
    const lowStockProducts = await Product.find({
      stock: { $lte: WARNING_THRESHOLD },
      status: { $ne: 'Inactive' }
    }).select('name category stock');

    let created = 0;
    let updated = 0;

    for (const product of lowStockProducts) {
      const priority = product.stock <= LOW_STOCK_THRESHOLD ? 'critical' : 'warning';
      const threshold = priority === 'critical' ? LOW_STOCK_THRESHOLD : WARNING_THRESHOLD;

      // Check if alert exists
      const existingAlert = await InventoryAlert.findOne({
        product: product._id,
        status: 'active'
      });

      if (existingAlert) {
        // Update existing alert if stock changed
        if (existingAlert.currentStock !== product.stock) {
          existingAlert.currentStock = product.stock;
          existingAlert.priority = priority;
          existingAlert.threshold = threshold;
          existingAlert.updatedAt = new Date();
          await existingAlert.save();
          updated++;
        }
      } else {
        // Create new alert
        const alert = new InventoryAlert({
          product: product._id,
          productName: product.name,
          category: product.category,
          currentStock: product.stock,
          threshold,
          priority
        });
        await alert.save();
        created++;
      }
    }

    res.json({
      success: true,
      data: { created, updated, totalProcessed: lowStockProducts.length },
      message: `Sync complete: ${created} created, ${updated} updated`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAlerts,
  getAlertsSummary,
  createAlert,
  resolveAlert,
  acknowledgeAlert,
  requestReplenishment,
  exportReport,
  syncAlertsFromProducts
};
