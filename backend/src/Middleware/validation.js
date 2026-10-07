const Joi = require('joi');
const { AppError } = require('./errorHandler');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { 
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(`Validation Error: ${errorMessage}`, 400, 'VALIDATION_ERROR'));
    }
    
    next();
  };
};

// Product validation schemas
const productCreateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required().messages({
    'string.empty': 'Product title is required',
    'string.max': 'Product title must be less than 200 characters'
  }),
  
  description: Joi.string().trim().min(1).max(2000).required().messages({
    'string.empty': 'Product description is required',
    'string.max': 'Product description must be less than 2000 characters'
  }),
  
  category: Joi.object({
    categoryId: Joi.string().required().messages({
      'string.empty': 'Category ID is required'
    }),
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    imageUrl: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ).optional(),
    type: Joi.string().valid('silver', 'customSilver', 'gold', 'other').required()
  }).required(),
  
  // Gold product fields
  constantPrice: Joi.when('category.type', {
    is: 'gold',
    then: Joi.number().positive().required().messages({
      'number.positive': 'Constant price must be a positive number',
      'any.required': 'Constant price is required for gold products'
    }),
    otherwise: Joi.number().positive().optional()
  }),
  
  height: Joi.when('category.type', {
    is: 'gold',
    then: Joi.string().min(1).required().messages({
      'any.required': 'Height is required for gold products'
    }),
    otherwise: Joi.string().optional()
  }),
  
  // Silver product fields
  weightInTola: Joi.when('category.type', {
    is: Joi.valid('silver', 'customSilver'),
    then: Joi.number().positive().required().messages({
      'number.positive': 'Weight must be a positive number',
      'any.required': 'Weight in tola is required for silver products'
    }),
    otherwise: Joi.number().positive().optional()
  }),
  
  makingCost: Joi.when('category.type', {
    is: Joi.valid('silver', 'customSilver'),
    then: Joi.number().min(0).required().messages({
      'number.min': 'Making cost cannot be negative',
      'any.required': 'Making cost is required for silver products'
    }),
    otherwise: Joi.number().min(0).optional()
  }),
  
  // Custom silver fields
  weightRange: Joi.when('category.type', {
    is: 'customSilver',
    then: Joi.object({
      min: Joi.number().positive().required().messages({
        'any.required': 'Minimum weight is required for custom silver products'
      }),
      max: Joi.number().positive().greater(Joi.ref('min')).required().messages({
        'number.greater': 'Maximum weight must be greater than minimum weight',
        'any.required': 'Maximum weight is required for custom silver products'
      })
    }).required(),
    otherwise: Joi.object({
      min: Joi.number().positive().optional(),
      max: Joi.number().positive().optional()
    }).optional()
  }),
  
  isCustomizable: Joi.boolean().default(false),
  silverPricePerTola: Joi.number().positive().optional()
});

const productUpdateSchema = productCreateSchema.fork([
  'title', 'description', 'category'
], (schema) => schema.optional());

// Category validation schemas
const categoryCreateSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    'string.empty': 'Category name is required',
    'string.max': 'Category name must be less than 100 characters'
  }),
  
  description: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Category description must be less than 500 characters'
  }),
  
  type: Joi.string().valid('silver', 'customSilver', 'gold', 'other').default('other'),
  
  details: Joi.object().optional()
});

const categoryUpdateSchema = categoryCreateSchema.fork([
  'name'
], (schema) => schema.optional());

// Admin validation schemas
const adminLoginSchema = Joi.object({
  username: Joi.alternatives().try(
    Joi.string().email(),
    Joi.string().min(3).max(50)
  ).required().messages({
    'alternatives.match': 'Username must be a valid email or username',
    'any.required': 'Username is required'
  }),
  
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

// Order validation schemas
const orderCreateSchema = Joi.object({
  sessionId: Joi.string().required().messages({
    'any.required': 'Session ID is required'
  }),
  
  customerInfo: Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Customer name is required',
      'string.max': 'Customer name must be less than 100 characters'
    }),
    
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).min(10).max(20).required().messages({
      'string.pattern.base': 'Phone number format is invalid',
      'string.min': 'Phone number must be at least 10 digits',
      'any.required': 'Phone number is required'
    }),
    
    address: Joi.string().trim().min(5).max(500).required().messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address must be less than 500 characters',
      'any.required': 'Address is required'
    }),
    
    email: Joi.string().email().optional()
  }).required(),
  
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required().messages({
        'any.required': 'Product ID is required for each item'
      }),
      
      quantity: Joi.number().integer().min(1).max(100).default(1).messages({
        'number.min': 'Quantity must be at least 1',
        'number.max': 'Quantity cannot exceed 100'
      }),
      
      customization: Joi.object({
        weight: Joi.number().positive().optional(),
        notes: Joi.string().max(500).optional()
      }).optional()
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required',
    'any.required': 'Order items are required'
  }),
  
  notes: Joi.string().max(1000).optional()
});

// Cart validation schemas
const cartAddItemSchema = Joi.object({
  productId: Joi.string().required().messages({
    'any.required': 'Product ID is required'
  }),
  
  quantity: Joi.number().integer().min(1).max(100).default(1).messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 100'
  }),
  
  customization: Joi.object({
    weight: Joi.number().positive().optional(),
    notes: Joi.string().max(200).optional()
  }).optional()
});

const cartUpdateItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).required().messages({
    'number.min': 'Quantity must be at least 1',
    'number.max': 'Quantity cannot exceed 100',
    'any.required': 'Quantity is required'
  }),
  
  customization: Joi.object({
    weight: Joi.number().positive().optional(),
    notes: Joi.string().max(200).optional()
  }).optional()
});

const customerInfoSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  phone: Joi.string().pattern(/^[+]?[\d\s\-()]+$/).min(10).max(20).required(),
  address: Joi.string().trim().min(5).max(500).required(),
  email: Joi.string().email().optional()
});

// Query parameter validation
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(`Query Validation Error: ${errorMessage}`, 400, 'VALIDATION_ERROR'));
    }
    
    req.query = value;
    next();
  };
};

const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

const productQuerySchema = paginationQuerySchema.keys({
  category: Joi.string().optional(),
  categoryName: Joi.string().optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string().valid('name', 'price-asc', 'price-desc', 'newest', 'oldest').default('newest')
});

module.exports = {
  validate,
  validateQuery,
  schemas: {
    productCreate: productCreateSchema,
    productUpdate: productUpdateSchema,
    categoryCreate: categoryCreateSchema,
    categoryUpdate: categoryUpdateSchema,
    adminLogin: adminLoginSchema,
    orderCreate: orderCreateSchema,
    cartAddItem: cartAddItemSchema,
    cartUpdateItem: cartUpdateItemSchema,
    customerInfo: customerInfoSchema,
    productQuery: productQuerySchema,
    paginationQuery: paginationQuerySchema
  }
};
