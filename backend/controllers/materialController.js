const Material = require('../models/Material');
const Product = require('../models/Product');

// @desc    Get all materials (readable by authenticated users)
// @route   GET /api/materials
// @access  Private (Staff can read, Admin can write)
const getMaterials = async (req, res) => {
  const { search, isActive, page = 1, limit = 20, sort = 'name' } = req.query;

  const query = {};

  // Filter by active status
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Search in name and description
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const materials = await Material.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Material.countDocuments(query);

  console.log(`[MATERIALS] User ${req.user?.email} fetched ${materials.length} materials (Total: ${total})`);

  res.json({
    success: true,
    data: {
      materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
};

// @desc    Get single material (admin only)
// @route   GET /api/materials/:id
// @access  Private/Admin
const getMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Material not found',
    });
  }

  res.json({
    success: true,
    data: material,
  });
};

// @desc    Create material (admin only)
// @route   POST /api/materials
// @access  Private/Admin
const createMaterial = async (req, res) => {
  const { name, unit, currentStock, reorderLevel, description, supplier, unitPrice } = req.body;

  // Check if material with same name already exists (and is active)
  const existingMaterial = await Material.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    isActive: true
  });

  if (existingMaterial) {
    return res.status(400).json({
      success: false,
      message: 'Material with this name already exists',
    });
  }

  const material = await Material.create({
    name,
    unit,
    currentStock: currentStock || 0,
    reorderLevel: reorderLevel || 10,
    description,
    supplier,
    unitPrice,
  });

  res.status(201).json({
    success: true,
    data: material,
    message: 'Material created successfully',
  });
};

// @desc    Update material (admin only)
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res) => {
  const { name, unit, currentStock, reorderLevel, description, supplier, unitPrice, isActive } = req.body;

  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Material not found',
    });
  }

  // Check if new name conflicts with existing active material (exclude current material)
  if (name && name !== material.name) {
    const existingMaterial = await Material.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id },
      isActive: true
    });

    if (existingMaterial) {
      return res.status(400).json({
        success: false,
        message: 'Material with this name already exists',
      });
    }
  }

  // Update fields
  if (name !== undefined) material.name = name;
  if (unit !== undefined) material.unit = unit;
  if (currentStock !== undefined) material.currentStock = currentStock;
  if (reorderLevel !== undefined) material.reorderLevel = reorderLevel;
  if (description !== undefined) material.description = description;
  if (supplier !== undefined) material.supplier = supplier;
  if (unitPrice !== undefined) material.unitPrice = unitPrice;
  if (isActive !== undefined) material.isActive = isActive;

  await material.save();

  res.json({
    success: true,
    data: material,
    message: 'Material updated successfully',
  });
};

// @desc    Delete material (soft delete - set isActive to false)
// @route   DELETE /api/materials/:id
// @access  Private/Admin
const deleteMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Material not found',
    });
  }

  // Check if material is used in any product recipes
  const productsUsingMaterial = await Product.countDocuments({
    'recipe.material': req.params.id,
  });

  if (productsUsingMaterial > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete material. It is used in ${productsUsingMaterial} product recipe(s). Please remove it from all recipes first.`,
    });
  }

  // Soft delete - set isActive to false
  material.isActive = false;
  await material.save();

  res.json({
    success: true,
    message: 'Material deleted successfully',
  });
};

// @desc    Get low stock materials (admin only)
// @route   GET /api/materials/low-stock
// @access  Private/Admin
const getLowStockMaterials = async (req, res) => {
  const { limit = 5 } = req.query;

  // Find materials where currentStock <= reorderLevel and isActive = true
  const materials = await Material.find({
    isActive: true,
    $expr: { $lte: ['$currentStock', '$reorderLevel'] },
  })
    .sort({ currentStock: 1, name: 1 })
    .limit(parseInt(limit))
    .lean();

  res.json({
    success: true,
    data: materials,
  });
};

// @desc    Adjust material stock (admin only) - for manual stock adjustments
// @route   PATCH /api/materials/:id/adjust-stock
// @access  Private/Admin
const adjustMaterialStock = async (req, res) => {
  const { adjustment, reason } = req.body;

  if (typeof adjustment !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Adjustment amount is required and must be a number',
    });
  }

  const material = await Material.findById(req.params.id);

  if (!material) {
    return res.status(404).json({
      success: false,
      message: 'Material not found',
    });
  }

  const newStock = material.currentStock + adjustment;

  if (newStock < 0) {
    return res.status(400).json({
      success: false,
      message: 'Adjustment would result in negative stock',
    });
  }

  material.currentStock = newStock;
  await material.save();

  res.json({
    success: true,
    data: material,
    message: `Stock adjusted by ${adjustment}. New stock: ${newStock}`,
  });
};

module.exports = {
  getMaterials,
  getMaterial,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  adjustMaterialStock,
};