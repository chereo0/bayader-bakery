const Joi = require('joi')

const createSchema = Joi.object({
  title: Joi.string().min(1).required(),
  name: Joi.string().allow('', null),
  date: Joi.string().allow('', null),
  time: Joi.string().allow('', null),
  venue: Joi.string().allow('', null),
  price: Joi.string().allow('', null),
  theme: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.any().optional()
})

const updateSchema = Joi.object({
  title: Joi.string().min(1).optional(),
  name: Joi.string().optional(),
  date: Joi.string().optional(),
  time: Joi.string().optional(),
  venue: Joi.string().optional(),
  price: Joi.string().optional(),
  theme: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.any().optional()
})

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true })
  if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details.map(d=>d.message) })
  next()
}

module.exports = { createSchema, updateSchema, validate }
