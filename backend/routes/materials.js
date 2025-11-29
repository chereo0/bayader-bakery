const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  adjustMaterialStock,
} = require('../controllers/materialController');
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { validateMaterial, validateMaterialUpdate } = require('../validators/materialValidator');

// All routes require authentication
router.use(auth);

// GET routes - readable by all authenticated users (staff needs read access)
// @route   GET /api/materials/low-stock
router.get('/low-stock', getLowStockMaterials);

// @route   GET /api/materials
router.get('/', getMaterials);

// Modification routes require admin
router.use(requireRole('admin'));

// @route   POST /api/materials
router.post('/', validateMaterial, createMaterial);

// @route   GET /api/materials/:id
// @route   PUT /api/materials/:id
// @route   DELETE /api/materials/:id
router
  .route('/:id')
  .put(validateMaterialUpdate, updateMaterial)
  .delete(deleteMaterial);

// GET by ID should be before admin middleware
router.get('/:id', auth, getMaterial);

// @route   PATCH /api/materials/:id/adjust-stock
router.patch('/:id/adjust-stock', adjustMaterialStock);

module.exports = router;