const User = require('../models/User');
const logger = require('../utils/logger');

// GET /api/admin/staff - List all staff users
const listStaff = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const search = req.query.search ? String(req.query.search).trim() : '';
    const department = req.query.department ? String(req.query.department).trim() : '';

    const filter = { role: 'staff' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      filter.department = department;
    }

    const total = await User.countDocuments(filter);
    const staff = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');

    logger.info(`Listed staff users: ${staff.length}/${total}`);

    res.json({
      success: true,
      data: staff,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    logger.error('Error listing staff', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/staff/:id - Get single staff member
const getStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id).select('-password');

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'User is not a staff member' });
    }

    res.json({ success: true, data: staff });
  } catch (err) {
    logger.error('Error getting staff', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/staff - Create new staff user
const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, department } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email, and password are required'
      });
    }

    if (department && !['Production', 'Delivery', 'Quality Control', 'Management'].includes(department)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department. Must be one of: Production, Delivery, Quality Control, Management'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }

    // Create staff user
    const staff = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'staff',
      phone: phone || null,
      department: department || 'Production'
    });

    await staff.save();

    const response = staff.toObject();
    delete response.password;

    logger.info(`Created new staff member: ${staff._id} (${staff.email})`);

    res.status(201).json({
      success: true,
      data: response,
      message: 'Staff member created successfully'
    });
  } catch (err) {
    logger.error('Error creating staff', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/staff/:id - Update staff member
const updateStaff = async (req, res) => {
  try {
    const { name, email, phone, department, password } = req.body;

    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'User is not a staff member' });
    }

    // Update allowed fields
    if (name !== undefined) staff.name = name.trim();
    
    if (email !== undefined) {
      // Check if new email is already in use by another user
      const emailExists = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: staff._id }
      });
      if (emailExists) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }
      staff.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) staff.phone = phone;

    if (department !== undefined) {
      if (!['Production', 'Delivery', 'Quality Control', 'Management'].includes(department)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid department. Must be one of: Production, Delivery, Quality Control, Management'
        });
      }
      staff.department = department;
    }

    if (password !== undefined && password) {
      staff.password = password;
    }

    await staff.save();

    const response = staff.toObject();
    delete response.password;

    logger.info(`Updated staff member: ${staff._id}`);

    res.json({
      success: true,
      data: response,
      message: 'Staff member updated successfully'
    });
  } catch (err) {
    logger.error('Error updating staff', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/staff/:id - Delete staff member
const deleteStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'User is not a staff member' });
    }

    // Prevent deleting current user
    if (req.user && req.user.id === staff._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await User.findByIdAndDelete(staff._id);

    logger.info(`Deleted staff member: ${staff._id}`);

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (err) {
    logger.error('Error deleting staff', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  listStaff,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
