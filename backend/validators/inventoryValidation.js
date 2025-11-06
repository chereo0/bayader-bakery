const Joi = require('joi')

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  operation: Joi.string().valid('set', 'add', 'subtract').optional()
})

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true })
  if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d=>d.message) })
  next()
}

module.exports = { updateStockSchema, validate }
