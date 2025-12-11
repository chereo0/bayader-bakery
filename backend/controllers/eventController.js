const Event = require('../models/Event')

// GET /api/events/public - List public active events
// Returns only isActive = true and within date range or upcoming
const getPublicEvents = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const search = req.query.search ? String(req.query.search).trim() : ''

    const now = new Date()

    // Build filter for public events - always require isActive and valid dates
    const filter = { 
      isActive: true,
      $or: [
        { startDate: { $gte: now } },  // Future events
        { endDate: { $gte: now } }     // Ongoing events
      ]
    }

    // Add search filter if provided
    // When searching, events must match BOTH date criteria AND search terms
    if (search) {
      filter.$and = [
        { 
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { venue: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ]
    }

    const total = await Event.countDocuments(filter)
    const items = await Event.find(filter)
      .sort({ startDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-createdBy')

    res.json({ success: true, data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
  } catch (err) {
    console.error('Error fetching public events:', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

// GET /api/events - List all events (admin only)
const listEvents = async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(100, parseInt(req.query.limit) || 20)
  const search = req.query.search ? String(req.query.search).trim() : ''

  const filter = {}
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
      { date: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ]
  }

  const total = await Event.countDocuments(filter)
  const items = await Event.find(filter)
    .sort({ startDate: -1, date: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('createdBy', 'name email')

  res.json({ success: true, data: items, meta: { total, page, limit, pages: Math.ceil(total / limit) } })
}

// GET /api/events/:id - Get single event (admin only)
const getEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id).populate('createdBy', 'name email')
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  res.json({ success: true, data: ev })
}

// POST /api/events - Create new event (admin only)
const createEvent = async (req, res) => {
  const payload = req.body || {}
  if (!payload.title) return res.status(400).json({ success: false, message: 'title is required' })
  
  const ev = new Event({
    title: payload.title,
    name: payload.name,
    description: payload.description,
    date: payload.date,
    startDate: payload.startDate,
    endDate: payload.endDate,
    time: payload.time,
    venue: payload.venue,
    price: payload.price,
    perPersonPrice: payload.perPersonPrice !== undefined ? payload.perPersonPrice : null,
    image: payload.image,
    isActive: payload.isActive !== false,
    createdBy: req.user?.id,
    theme: payload.theme || [],
    metadata: payload.metadata || {}
  })
  await ev.save()
  await ev.populate('createdBy', 'name email')
  res.status(201).json({ success: true, data: ev })
}

// PUT /api/events/:id - Update event (admin only)
const updateEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  
  const up = req.body || {}
  const allowed = ['title', 'name', 'description', 'date', 'startDate', 'endDate', 'time', 'venue', 'price', 'perPersonPrice', 'image', 'isActive', 'theme', 'metadata']
  
  for (const k of allowed) {
    if (up[k] !== undefined) {
      ev[k] = up[k]
    }
  }
  
  await ev.save()
  await ev.populate('createdBy', 'name email')
  res.json({ success: true, data: ev })
}

// DELETE /api/events/:id - Delete event (admin only)
const deleteEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  await ev.deleteOne()
  res.json({ success: true, message: 'Event deleted' })
}

module.exports = { getPublicEvents, listEvents, getEvent, createEvent, updateEvent, deleteEvent }
