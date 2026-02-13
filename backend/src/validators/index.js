/**
 * Request Validators
 * Joi schemas for request validation
 */

const Joi = require('joi');
const { VALIDATION, REGEX } = require('../constants');

// Custom validators
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/, 'valid MongoDB ObjectId');

const email = Joi.string()
  .email()
  .max(VALIDATION.EMAIL_MAX_LENGTH)
  .lowercase()
  .trim()
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  });

const password = Joi.string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH)
  .max(VALIDATION.PASSWORD_MAX_LENGTH)
  .pattern(REGEX.PASSWORD)
  .required()
  .messages({
    'string.min': `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters long`,
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    'any.required': 'Password is required',
  });

const name = Joi.string()
  .min(VALIDATION.NAME_MIN_LENGTH)
  .max(VALIDATION.NAME_MAX_LENGTH)
  .trim()
  .required()
  .messages({
    'string.min': `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters long`,
    'any.required': 'Name is required',
  });

const phone = Joi.string()
  .pattern(REGEX.PHONE)
  .min(VALIDATION.PHONE_MIN_LENGTH)
  .max(VALIDATION.PHONE_MAX_LENGTH)
  .required()
  .messages({
    'string.pattern.base': 'Please provide a valid phone number',
    'any.required': 'Phone number is required',
  });

// Auth Validators
const authValidators = {
  register: Joi.object({
    name,
    email,
    password,
  }),

  login: Joi.object({
    email,
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: password,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
  }),

  updateProfile: Joi.object({
    name: Joi.string()
      .min(VALIDATION.NAME_MIN_LENGTH)
      .max(VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .optional(),
    email: Joi.string()
      .email()
      .max(VALIDATION.EMAIL_MAX_LENGTH)
      .lowercase()
      .trim()
      .optional(),
  }).min(1),
};

// Customer Validators
const customerValidators = {
  create: Joi.object({
    name,
    email,
    phone,
    address: Joi.string().max(200).required().messages({
      'any.required': 'Address is required',
    }),
    company: Joi.string().max(100).optional().allow(''),
    notes: Joi.string().max(500).optional().allow(''),
  }),

  update: Joi.object({
    name: Joi.string()
      .min(VALIDATION.NAME_MIN_LENGTH)
      .max(VALIDATION.NAME_MAX_LENGTH)
      .trim()
      .optional(),
    email: Joi.string()
      .email()
      .max(VALIDATION.EMAIL_MAX_LENGTH)
      .lowercase()
      .trim()
      .optional(),
    phone: Joi.string()
      .pattern(REGEX.PHONE)
      .min(VALIDATION.PHONE_MIN_LENGTH)
      .max(VALIDATION.PHONE_MAX_LENGTH)
      .optional(),
    address: Joi.string().max(200).optional(),
    company: Joi.string().max(100).optional().allow(''),
    notes: Joi.string().max(500).optional().allow(''),
    isActive: Joi.boolean().optional(),
  }).min(1),

  query: Joi.object({
    search: Joi.string().max(100).optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('name', 'createdAt', 'email').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    isActive: Joi.boolean().optional(),
  }),

  params: Joi.object({
    id: objectId.required(),
  }),
};

// Submission Validators
const submissionValidators = {
  create: Joi.object({
    customer: Joi.string().required().messages({
      'any.required': 'Customer name is required',
    }),
    date: Joi.string().isoDate().required().messages({
      'any.required': 'Date is required',
      'string.isoDate': 'Please provide a valid date in ISO format (YYYY-MM-DD)',
    }),
    time: Joi.string()
      .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .required()
      .messages({
        'any.required': 'Time is required',
        'string.pattern.base': 'Please provide time in HH:MM format',
      }),
    address: Joi.string().max(200).required().messages({
      'any.required': 'Address is required',
    }),
    order: Joi.string().max(200).required().messages({
      'any.required': 'Order details are required',
    }),
    amount: Joi.number().min(0).required().messages({
      'any.required': 'Amount is required',
      'number.min': 'Amount cannot be negative',
    }),
    rego: Joi.string().max(20).uppercase().required().messages({
      'any.required': 'Registration number is required',
    }),
    signature: Joi.string().dataUri().optional().allow(''),
    notes: Joi.string().max(500).optional().allow(''),
  }),

  update: Joi.object({
    customer: Joi.string().optional(),
    date: Joi.string().isoDate().optional(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    address: Joi.string().max(200).optional(),
    order: Joi.string().max(200).optional(),
    amount: Joi.number().min(0).optional(),
    rego: Joi.string().max(20).uppercase().optional(),
    signature: Joi.string().dataUri().optional().allow(''),
    status: Joi.string().valid('pending', 'completed', 'cancelled', 'in_progress').optional(),
    notes: Joi.string().max(500).optional().allow(''),
  }).min(1),

  query: Joi.object({
    customer: Joi.string().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    status: Joi.string().valid('pending', 'completed', 'cancelled', 'in_progress').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('date', 'createdAt', 'customer', 'amount').default('date'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  params: Joi.object({
    id: objectId.required(),
  }),
};

// Docket Validators
const docketValidators = {
  generate: Joi.object({
    customer: Joi.string().required().messages({
      'any.required': 'Customer name is required',
    }),
    startDate: Joi.string().isoDate().required().messages({
      'any.required': 'Start date is required',
      'string.isoDate': 'Please provide a valid start date',
    }),
    endDate: Joi.string().isoDate().required().messages({
      'any.required': 'End date is required',
      'string.isoDate': 'Please provide a valid end date',
    }),
    notes: Joi.string().max(500).optional().allow(''),
  }).custom((value, helpers) => {
    if (new Date(value.startDate) > new Date(value.endDate)) {
      return helpers.error('any.invalid', {
        message: 'Start date must be before end date',
      });
    }
    return value;
  }),

  query: Joi.object({
    customer: Joi.string().optional(),
    status: Joi.string().valid('draft', 'final', 'sent', 'paid', 'overdue').optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('createdAt', 'docketNumber', 'customer').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  params: Joi.object({
    id: objectId.required(),
  }),
};

/**
 * Validate request data against schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Validate route parameters
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  authValidators,
  customerValidators,
  submissionValidators,
  docketValidators,
  validate,
  validateQuery,
  validateParams,
};
