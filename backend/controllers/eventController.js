const Event = require('../models/Event')

// GET /api/events
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
      { date: { $regex: search, $options: 'i' } }
    ]
  }

  const total = await Event.countDocuments(filter)
  const items = await Event.find(filter)
    .sort({ date: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)

  res.json({ success: true, data: items, meta: { total, page, limit } })
}

// GET /api/events/:id
const getEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  res.json({ success: true, data: ev })
}

// POST /api/events
const createEvent = async (req, res) => {
  const payload = req.body || {}
  if (!payload.title) return res.status(400).json({ success: false, message: 'title is required' })
  const ev = new Event({
    title: payload.title,
    name: payload.name,
    date: payload.date,
    time: payload.time,
    venue: payload.venue,
    price: payload.price,
    theme: payload.theme || [],
    metadata: payload.metadata || {}
  })
  await ev.save()
  res.status(201).json({ success: true, data: ev })
}

// PUT /api/events/:id
const updateEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  const up = req.body || {}
  const allowed = ['title','name','date','time','venue','price','theme','metadata']
  for (const k of allowed) if (up[k] !== undefined) ev[k] = up[k]
  await ev.save()
  res.json({ success: true, data: ev })
}

// DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  const ev = await Event.findById(req.params.id)
  if (!ev) return res.status(404).json({ success: false, message: 'Event not found' })
  // use deleteOne for compatibility
  await ev.deleteOne()
  res.json({ success: true, message: 'Event deleted' })
}

module.exports = { listEvents, getEvent, createEvent, updateEvent, deleteEvent }
