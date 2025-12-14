const Product = require('../models/Product');
const Material = require('../models/Material');
const { LOW_STOCK_THRESHOLD } = require('../config');

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { category, status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;

  const query = {};

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by status - For public users, default to 'Active' status only
  if (status) {
    query.status = status;
  } else {
    // Default to showing only Active products for public users
    query.status = 'Active';
  }

  // Search in name and description
  if (search) {
    query.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const products = await Product.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .populate('relatedProducts', 'name price image')
    .populate('recipe.material', 'name unit')
    .lean();

  const total = await Product.countDocuments(query);

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('relatedProducts', 'name price image')
    .populate('reviews.user', 'name')
    .populate('recipe.material', 'name unit');

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  res.json({
    success: true,
    data: product,
  });
};

// @desc    Create new product (admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, category, description, price, stock, image, images, ingredients, relatedProducts, recipe } = req.body;

  // Validate recipe materials if provided
  if (recipe && recipe.length > 0) {
    const materialIds = recipe.map(item => item.material);
    const existingMaterials = await Material.find({ 
      _id: { $in: materialIds },
      isActive: true 
    });
    
    if (existingMaterials.length !== materialIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more materials in the recipe do not exist or are inactive',
      });
    }
  }

  const product = await Product.create({
    name,
    category,
    description,
    price,
    stock,
    image,
    images,
    ingredients,
    relatedProducts,
    recipe: recipe || [],
  });

  // Populate recipe materials for response
  await product.populate('recipe.material', 'name unit');

  res.status(201).json({
    success: true,
    data: product,
  });
};

// @desc    Update product (admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, category, description, price, stock, status, image, images, ingredients, relatedProducts, recipe } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Validate recipe materials if provided
  if (recipe !== undefined && recipe.length > 0) {
    const materialIds = recipe.map(item => item.material);
    const existingMaterials = await Material.find({ 
      _id: { $in: materialIds },
      isActive: true 
    });
    
    if (existingMaterials.length !== materialIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more materials in the recipe do not exist or are inactive',
      });
    }
  }

  // Update fields
  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (status !== undefined) product.status = status;
  if (image !== undefined) product.image = image;
  if (images !== undefined) product.images = images;
  if (ingredients !== undefined) product.ingredients = ingredients;
  if (relatedProducts !== undefined) product.relatedProducts = relatedProducts;
  if (recipe !== undefined) product.recipe = recipe;

  await product.save();

  // Populate recipe materials for response
  await product.populate('recipe.material', 'name unit');

  res.json({
    success: true,
    data: product,
  });
};

// @desc    Delete product (admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = async (req, res) => {
  const { comment, rating } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user.id
  );

  if (alreadyReviewed) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product',
    });
  }

  const review = {
    user: req.user.id,
    userName: req.user.name || req.user.email,
    comment,
    rating: rating || 5,
  };

  product.reviews.push(review);
  product.calculateAverageRating();

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: product,
  });
};

// @desc    Get low stock products (admin/staff)
// @route   GET /api/products/inventory/low-stock
// @access  Private/Admin/Staff
const getLowStockProducts = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || LOW_STOCK_THRESHOLD || 10;

  const products = await Product.find({
    stock: { $lte: threshold },
    status: { $ne: 'Inactive' },
  })
    .sort('stock')
    .select('name category stock price')
    .lean();

  res.json({
    success: true,
    data: {
      products,
      count: products.length,
      threshold,
    },
  });
};

// @desc    Upload product image (Cloudinary)
// @route   POST /api/products/upload
// @access  Private/Admin
const uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Cloudinary automatically uploads and returns the URL
  const fileUrl = req.file.path; // Cloudinary URL
  const publicId = req.file.filename; // Cloudinary public ID

  console.log('✅ [UPLOAD] File uploaded to Cloudinary:');
  console.log('   URL:', fileUrl);
  console.log('   Public ID:', publicId);
  console.log('   Full file object keys:', Object.keys(req.file));

  // Validate URL format
  if (!fileUrl || (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://'))) {
    console.error('❌ [UPLOAD] Invalid URL format:', fileUrl);
    return res.status(500).json({ 
      success: false, 
      message: 'Invalid Cloudinary URL',
      debug: { fileUrl, publicId }
    });
  }

  res.status(201).json({ 
    success: true, 
    data: { 
      url: fileUrl,
      filename: publicId,
      publicId // Can be used later to delete the image
    } 
  });
};

// @desc    Update product stock (admin/staff)
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin/Staff
const updateStock = async (req, res) => {
  const { quantity, operation = 'set' } = req.body;

  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid quantity is required',
    });
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  // Set, add, or subtract stock
  if (operation === 'add') {
    product.stock += quantity;
  } else if (operation === 'subtract') {
    product.stock = Math.max(0, product.stock - quantity);
  } else {
    product.stock = quantity;
  }

  await product.save();

  res.json({
    success: true,
    data: product,
  });
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getLowStockProducts,
  updateStock,
  uploadImage,
};
