const User = require('../models/User');

/**
 * @desc    Get user's saved cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('cart');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return cart items, default to empty array if no cart
    const cartItems = user.cart?.items || [];

    res.status(200).json({
      success: true,
      data: {
        items: cartItems
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

/**
 * @desc    Save user's cart
 * @route   POST /api/cart/save
 * @access  Private
 */
exports.saveCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    // Validate items array
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid item format. Each item must have id, name, price, and quantity'
        });
      }

      if (item.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be at least 1'
        });
      }
    }

    // Transform frontend cart format to backend format
    const cartItems = items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: item.image || '',
      quantity: item.quantity
    }));

    // Update user's cart
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = {
      items: cartItems,
      updatedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart saved successfully',
      data: {
        items: user.cart.items,
        updatedAt: user.cart.updatedAt
      }
    });
  } catch (error) {
    console.error('Error saving cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save cart',
      error: error.message
    });
  }
};

/**
 * @desc    Clear user's cart
 * @route   POST /api/cart/clear
 * @access  Private
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.cart = {
      items: [],
      updatedAt: new Date()
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};
