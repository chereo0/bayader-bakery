const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const { getPublicEvents, listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController')
const { createSchema, updateSchema, validate } = require('../validators/eventValidation')

// Public route - no auth required
router.get('/public', getPublicEvents)

// Protected admin routes for events management
router.get('/', auth, requireRole('admin'), listEvents)
router.get('/:id', auth, requireRole('admin'), getEvent)
router.post('/', auth, requireRole('admin'), validate(createSchema), createEvent)
router.put('/:id', auth, requireRole('admin'), validate(updateSchema), updateEvent)
router.delete('/:id', auth, requireRole('admin'), deleteEvent)

module.exports = router
