const request = require('supertest')
const express = require('express')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongod
let app

const Product = require('../models/Product')
const { updateStockSchema, validate } = require('../validators/inventoryValidation')
const { listInventory, getLowStock, updateStock } = require('../controllers/inventoryController')

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

  app = express()
  app.use(express.json())

  // mount test routes (bypass auth)
  app.get('/inventory', listInventory)
  app.get('/inventory/low-stock', getLowStock)
  app.patch('/inventory/:id/stock', validate(updateStockSchema), updateStock)
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

afterEach(async () => {
  await Product.deleteMany({})
})

describe('Inventory API (validation + controller)', () => {
  test('PATCH /inventory/:id/stock - validation rejects missing quantity', async () => {
    const p = await Product.create({ name: 'P1', price: 5, stock: 10, category: 'Cakes' })
    const res = await request(app).patch(`/inventory/${p._id}/stock`).send({})
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('message', 'Validation error')
  })

  test('PATCH set stock and GET list reflects change', async () => {
  const p = await Product.create({ name: 'Cake', price: 10, stock: 5, category: 'Cakes' })
    const setRes = await request(app).patch(`/inventory/${p._id}/stock`).send({ quantity: 2, operation: 'set' })
    expect(setRes.status).toBe(200)
    expect(setRes.body.data.stock).toBe(2)

    const listRes = await request(app).get('/inventory')
    expect(listRes.status).toBe(200)
    expect(Array.isArray(listRes.body.data.products)).toBe(true)
    expect(listRes.body.data.products.length).toBe(1)
    expect(listRes.body.data.products[0].stock).toBe(2)
  })

  test('PATCH add and subtract operations', async () => {
  const p = await Product.create({ name: 'Bread', price: 3, stock: 10, category: 'Breads' })
    const addRes = await request(app).patch(`/inventory/${p._id}/stock`).send({ quantity: 5, operation: 'add' })
    expect(addRes.status).toBe(200)
    expect(addRes.body.data.stock).toBe(15)

    const subRes = await request(app).patch(`/inventory/${p._id}/stock`).send({ quantity: 20, operation: 'subtract' })
    expect(subRes.status).toBe(200)
    // cannot go below 0
    expect(subRes.body.data.stock).toBe(0)
  })

  test('GET low-stock returns products below threshold', async () => {
  await Product.create({ name: 'Low1', price: 2, stock: 1, category: 'Pastries' })
  await Product.create({ name: 'High', price: 2, stock: 20, category: 'Pastries' })
    const low = await request(app).get('/inventory/low-stock?threshold=5')
    expect(low.status).toBe(200)
    expect(low.body.data.products.length).toBe(1)
    expect(low.body.data.products[0].name).toBe('Low1')
  })
})
