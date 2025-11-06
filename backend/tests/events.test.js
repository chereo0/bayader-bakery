const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod
let app

const Event = require('../models/Event')
const { createSchema, updateSchema, validate } = require('../validators/eventValidation')
const { listEvents, getEvent, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController')

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  app = express()
  app.use(express.json())

  // Test router uses validation but bypasses auth
  app.post('/events', validate(createSchema), createEvent)
  app.get('/events', listEvents)
  app.put('/events/:id', validate(updateSchema), updateEvent)
  app.delete('/events/:id', deleteEvent)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  // Clear collections
  await Event.deleteMany({})
})

describe('Events API (controller + validation)', () => {
  test('POST /events - validation fails without title', async () => {
    const res = await request(app).post('/events').send({ name: 'No title' })
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message', 'Validation error')
  })

  test('POST /events - create and GET list', async () => {
    const payload = { title: 'Test Event', name: 'Tester', date: '2025-12-01' }
    const createRes = await request(app).post('/events').send(payload)
    expect(createRes.status).toBe(201)
    expect(createRes.body).toHaveProperty('data')
    const id = createRes.body.data._id

    const listRes = await request(app).get('/events')
    expect(listRes.status).toBe(200)
    expect(Array.isArray(listRes.body.data)).toBe(true)
    expect(listRes.body.data.length).toBe(1)
    expect(String(listRes.body.data[0]._id)).toBe(String(id))
  })

  test('PUT /events/:id - update event', async () => {
    const createRes = await request(app).post('/events').send({ title: 'UpdateMe' })
    const id = createRes.body.data._id
    const updRes = await request(app).put(`/events/${id}`).send({ title: 'Updated' })
    expect(updRes.status).toBe(200)
    expect(updRes.body.data.title).toBe('Updated')
  })

  test('DELETE /events/:id - deletes event', async () => {
    const createRes = await request(app).post('/events').send({ title: 'ToDelete' })
    const id = createRes.body.data._id
    const delRes = await request(app).delete(`/events/${id}`)
    expect(delRes.status).toBe(200)
    const listRes = await request(app).get('/events')
    expect(listRes.body.data.length).toBe(0)
  })
})
