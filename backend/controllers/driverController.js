const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      email: user.email 
    },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/admin/drivers
// @desc    Create a new driver account (Admin only)
// @access  Private (Admin)
exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone'
      });
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if driver already exists
    const existingDriver = await User.findOne({ email });
    if (existingDriver) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create driver account
    const driver = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'driver',
      department: 'Delivery'
    });

    res.status(201).json({
      success: true,
      message: 'Driver account created successfully',
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        address: driver.address,
        role: driver.role,
        department: driver.department,
        createdAt: driver.createdAt
      }
    });
  } catch (err) {
    console.error('Create driver error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during driver creation'
    });
  }
};

// @route   GET /api/admin/drivers
// @desc    Get all drivers
// @access  Private (Admin/Staff)
exports.getAllDrivers = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    // Build filter
    const filter = { role: 'driver' };
    
    // Support status filtering if provided
    if (status) {
      const validStatuses = ['available', 'on-route', 'off-duty', 'on-break'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
        });
      }
      filter['profile.status'] = status;
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const drivers = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
      pagination: { 
        page: pageNum, 
        limit: limitNum, 
        total, 
        pages: Math.ceil(total / limitNum) 
      }
    });
  } catch (err) {
    console.error('Get drivers error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching drivers'
    });
  }
};

// @route   GET /api/admin/drivers/:id
// @desc    Get driver by ID
// @access  Private (Admin/Staff)
exports.getDriver = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id)
      .select('-password');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (err) {
    console.error('Get driver error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error fetching driver'
    });
  }
};

// @route   PUT /api/admin/drivers/:id
// @desc    Update driver information
// @access  Private (Admin/Staff)
exports.updateDriver = async (req, res) => {
  try {
    const { name, phone, address, email } = req.body;

    // Check if driver exists
    let driver = await User.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }

    // Check if new email is already taken (if trying to change email)
    if (email && email !== driver.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
      driver.email = email;
    }

    // Update driver
    if (name) driver.name = name;
    if (phone) driver.phone = phone;
    if (address) driver.address = address;

    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver updated successfully',
      data: {
        id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        address: driver.address,
        role: driver.role,
        department: driver.department
      }
    });
  } catch (err) {
    console.error('Update driver error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating driver'
    });
  }
};

// @route   DELETE /api/admin/drivers/:id
// @desc    Delete driver account
// @access  Private (Admin only)
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await User.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (err) {
    console.error('Delete driver error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error deleting driver'
    });
  }
};

// @route   POST /api/admin/drivers/:id/reset-password
// @desc    Admin reset driver password
// @access  Private (Admin only)
exports.resetDriverPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const driver = await User.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    if (driver.role !== 'driver') {
      return res.status(400).json({
        success: false,
        message: 'User is not a driver'
      });
    }

    // Update password
    driver.password = newPassword;
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver password reset successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error resetting password'
    });
  }
};
