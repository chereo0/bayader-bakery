const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getLowStockProducts,
  updateStock,
  uploadImage,
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { upload } = require('../config/cloudinary');

// DEBUG: Quick diagnostic endpoint
router.get('/debug/count', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const total = await Product.countDocuments({});
    const active = await Product.countDocuments({ status: 'Active' });
    const inactive = await Product.countDocuments({ status: 'Inactive' });
    const outOfStock = await Product.countDocuments({ status: 'Out of Stock' });
    const latest = await Product.findOne({}).sort({ createdAt: -1 }).lean();
    
    res.json({
      success: true,
      counts: { total, active, inactive, outOfStock },
      latest: latest ? { name: latest.name, status: latest.status, stock: latest.stock, category: latest.category, image: latest.image, images: latest.images } : null
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DEBUG: Fix existing products that have images in 'images' array but not in 'image' field
router.post('/debug/fix-images', async (req, res) => {
  try {
    const Product = require('../models/Product');
    const products = await Product.find({ 
      $or: [
        { image: { $exists: false } },
        { image: '' },
        { image: null }
      ],
      images: { $exists: true, $ne: [] }
    });
    
    let fixed = 0;
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        product.image = product.images[0];
        await product.save();
        fixed++;
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixed} products`,
      fixed
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin/Staff routes - Inventory management (must come before /:id routes)
router.get('/inventory/low-stock', auth, requireRole(['admin', 'staff']), getLowStockProducts);

// Admin only routes - Product CRUD
// Upload endpoint for admin to upload images
router.post('/upload', auth, requireRole(['admin']), upload.single('image'), uploadImage);

router.post('/', auth, requireRole(['admin']), createProduct);

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes - Customer can add reviews
router.post('/:id/reviews', auth, addReview);

// Admin/Staff routes - Stock management
router.patch('/:id/stock', auth, requireRole(['admin', 'staff']), updateStock);

// Admin only routes - Update and Delete
router.put('/:id', auth, requireRole(['admin']), updateProduct);
router.delete('/:id', auth, requireRole(['admin']), deleteProduct);

module.exports = router;
