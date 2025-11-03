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
const multer = require('multer');
const path = require('path');

// Configure multer storage to backend/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'))
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  }
})

const upload = multer({ storage });

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
