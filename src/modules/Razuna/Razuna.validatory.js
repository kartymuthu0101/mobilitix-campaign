import Joi from 'joi';
import { bodyParamValidation } from '../../helpers/validator.js';

/**
 * Validate file upload configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validateFileUpload = (req, res, next) => {
  // File validation is handled by multer middleware
  // This is just for additional configuration options
  const schema = Joi.object({
    resize: Joi.boolean().optional(),
    optimize: Joi.boolean().optional(),
    folder: Joi.string().optional()
  });
  
  return bodyParamValidation(req, res, next, schema);
};

export default {
  validateFileUpload
};