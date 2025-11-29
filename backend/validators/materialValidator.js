const Joi = require('joi');

const materialValidationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Material name is required',
    'string.max': 'Material name cannot exceed 100 characters',
  }),
  unit: Joi.string().valid('kg', 'g', 'lb', 'oz', 'l', 'ml', 'piece', 'cup', 'tbsp', 'tsp').required().messages({
    'any.only': 'Unit must be one of: kg, g, lb, oz, l, ml, piece, cup, tbsp, tsp',
    'any.required': 'Unit is required',
  }),
  currentStock: Joi.number().min(0).default(0).messages({
    'number.min': 'Current stock cannot be negative',
  }),
  reorderLevel: Joi.number().min(0).default(10).messages({
    'number.min': 'Reorder level cannot be negative',
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  supplier: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Supplier name cannot exceed 100 characters',
  }),
  unitPrice: Joi.number().min(0).messages({
    'number.min': 'Unit price cannot be negative',
  }),
  isActive: Joi.boolean(),
});

const materialUpdateValidationSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).messages({
    'string.empty': 'Material name cannot be empty',
    'string.max': 'Material name cannot exceed 100 characters',
  }),
  unit: Joi.string().valid('kg', 'g', 'lb', 'oz', 'l', 'ml', 'piece', 'cup', 'tbsp', 'tsp').messages({
    'any.only': 'Unit must be one of: kg, g, lb, oz, l, ml, piece, cup, tbsp, tsp',
  }),
  currentStock: Joi.number().min(0).messages({
    'number.min': 'Current stock cannot be negative',
  }),
  reorderLevel: Joi.number().min(0).messages({
    'number.min': 'Reorder level cannot be negative',
  }),
  description: Joi.string().trim().max(500).allow('').messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
  supplier: Joi.string().trim().max(100).allow('').messages({
    'string.max': 'Supplier name cannot exceed 100 characters',
  }),
  unitPrice: Joi.number().min(0).messages({
    'number.min': 'Unit price cannot be negative',
  }),
  isActive: Joi.boolean(),
});

const validateMaterial = (req, res, next) => {
  const { error, value } = materialValidationSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.body = value;
  next();
};

const validateMaterialUpdate = (req, res, next) => {
  const { error, value } = materialUpdateValidationSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      })),
    });
  }

  req.body = value;
  next();
};

module.exports = {
  validateMaterial,
  validateMaterialUpdate,
};