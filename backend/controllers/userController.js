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

module.exports = { listUsers, getUser, createUser, updateUser, deleteUser, bulkDeleteUsers };
