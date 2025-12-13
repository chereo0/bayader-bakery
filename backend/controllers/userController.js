const User = require('../models/User');

// GET /api/users
// Supports: ?page=&limit=&search=&role=
const listUsers = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const search = req.query.search ? String(req.query.search).trim() : '';
  const role = req.query.role ? String(req.query.role).trim() : '';

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) filter.role = role;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select('-password');

  res.json({ success: true, data: users, meta: { total, page, limit } });
};

// GET /api/users/:id
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

// POST /api/users  (admin)
const createUser = async (req, res) => {
  const { name, email, password, role, phone, address } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'name, email and password are required' });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });

  const user = new User({ name, email, password, role, phone, address });
  await user.save();
  const out = user.toObject();
  delete out.password;
  res.status(201).json({ success: true, data: out });
};

// PUT /api/users/:id  (admin)
const updateUser = async (req, res) => {
  const allowed = ['name', 'email', 'password', 'role', 'phone', 'address'];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  Object.assign(user, updates);
  await user.save();
  const out = user.toObject();
  delete out.password;
  res.json({ success: true, data: out });
};

// DELETE /api/users/:id  (admin)
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  await user.remove();
  res.json({ success: true, message: 'User deleted' });
};

// DELETE /api/users  (admin)  - bulk delete, expects JSON body { ids: [] }
const bulkDeleteUsers = async (req, res) => {
  // Allow body or query param
  let ids = []
  if (Array.isArray(req.body && req.body.ids)) ids = req.body.ids
  else if (typeof req.query.ids === 'string') ids = String(req.query.ids).split(',').map(s=>s.trim()).filter(Boolean)

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'ids array is required' })
  }

  // prevent deleting self
  const requesterId = req.user && req.user.id ? String(req.user.id) : null
  const filtered = ids.map(String).filter(id => id !== requesterId)

  // Find which ids actually exist
  const existing = await User.find({ _id: { $in: filtered } }).select('_id')
  const existingIds = existing.map(e => String(e._id))
  const missing = filtered.filter(id => !existingIds.includes(String(id)))

  // Perform deletion
  const result = await User.deleteMany({ _id: { $in: existingIds } })

  res.json({ success: true, deletedCount: result.deletedCount || 0, requested: ids.length, deletedIds: existingIds, missing, skippedSelf: requesterId && ids.includes(requesterId) });
}

// GET /api/users/settings/me - Get current user's settings
const getMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email phone department settings');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || 'Production'
      },
      notifications: user.settings?.notifications || {
        email: true,
        push: true,
        sms: false
      },
      preferences: user.settings?.preferences || {
        language: 'en',
        theme: 'light',
        timezone: 'UTC+3'
      }
    };
    
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/settings/me - Update current user's settings
const updateMySettings = async (req, res) => {
  try {
    const { profile, notifications, preferences } = req.body;
    
    const updates = {};
    
    if (profile) {
      if (profile.name) updates.name = profile.name;
      if (profile.email) {
        const exists = await User.findOne({ email: profile.email, _id: { $ne: req.user.id } });
        if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });
        updates.email = profile.email;
      }
      if (profile.phone) updates.phone = profile.phone;
      if (profile.department) updates.department = profile.department;
    }
    
    if (notifications) {
      updates['settings.notifications'] = {
        email: notifications.email !== undefined ? notifications.email : true,
        push: notifications.push !== undefined ? notifications.push : true,
        sms: notifications.sms !== undefined ? notifications.sms : false
      };
    }
    
    if (preferences) {
      updates['settings.preferences'] = {
        language: preferences.language || 'en',
        theme: preferences.theme || 'light',
        timezone: preferences.timezone || 'UTC+3'
      };
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('name email phone department settings');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const settings = {
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || 'Production'
      },
      notifications: user.settings?.notifications || {
        email: true,
        push: true,
        sms: false
      },
      preferences: user.settings?.preferences || {
        language: 'en',
        theme: 'light',
        timezone: 'UTC+3'
      }
    };
    
    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/settings/me/password - Change password for current user
const updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/me/addresses - Get all saved addresses for current user
const getMySavedAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedAddresses');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data: user.savedAddresses || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/me/addresses - Add a new saved address
const addSavedAddress = async (req, res) => {
  try {
    const { label, line1, line2, city, postalCode, country, phone, isDefault } = req.body;
    
    if (!label || !line1 || !city || !phone) {
      return res.status(400).json({ success: false, message: 'Label, address line 1, city, and phone are required' });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // If this is set as default, unset all other defaults
    if (isDefault) {
      user.savedAddresses.forEach(addr => addr.isDefault = false);
    }
    
    // If this is the first address, make it default
    const makeDefault = isDefault || user.savedAddresses.length === 0;
    
    const newAddress = {
      label,
      line1,
      line2: line2 || '',
      city,
      postalCode: postalCode || '',
      country: country || 'Saudi Arabia',
      phone,
      isDefault: makeDefault
    };
    
    user.savedAddresses.push(newAddress);
    await user.save();
    
    const addedAddress = user.savedAddresses[user.savedAddresses.length - 1];
    res.status(201).json({ success: true, data: addedAddress, message: 'Address saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/users/me/addresses/:addressId - Update a saved address
const updateSavedAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, line1, line2, city, postalCode, country, phone, isDefault } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const address = user.savedAddresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    
    // If setting as default, unset all other defaults
    if (isDefault) {
      user.savedAddresses.forEach(addr => addr.isDefault = false);
    }
    
    if (label) address.label = label;
    if (line1) address.line1 = line1;
    if (line2 !== undefined) address.line2 = line2;
    if (city) address.city = city;
    if (postalCode !== undefined) address.postalCode = postalCode;
    if (country) address.country = country;
    if (phone) address.phone = phone;
    if (isDefault !== undefined) address.isDefault = isDefault;
    
    await user.save();
    
    res.json({ success: true, data: address, message: 'Address updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/me/addresses/:addressId - Delete a saved address
const deleteSavedAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const address = user.savedAddresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    
    const wasDefault = address.isDefault;
    address.deleteOne();
    
    // If deleted address was default and there are other addresses, make the first one default
    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }
    
    await user.save();
    
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  listUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser, 
  bulkDeleteUsers, 
  getMySettings, 
  updateMySettings, 
  updateMyPassword,
  getMySavedAddresses,
  addSavedAddress,
  updateSavedAddress,
  deleteSavedAddress
};
