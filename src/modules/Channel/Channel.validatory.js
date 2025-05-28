import Joi from 'joi';
import { bodyParamValidation } from '../../helpers/validator.js';

/**
 * Validate create channel request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const createChannel = (req, res, next) => {
  const schema = Joi.object({
    channel_name: Joi.string().required(),
    description: Joi.string().optional(),
    status: Joi.string().required(),
  });
  
  return bodyParamValidation(req, res, next, schema);
};

/**
 * Validate update channel request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const updateChannel = (req, res, next) => {
  const schema = Joi.object({
    channel_name: Joi.string().optional(),
    description: Joi.string().optional(),
    status: Joi.string().optional(),
  }).min(1); // At least one field should be provided
  
  return bodyParamValidation(req, res, next, schema);
};

export default {
  createChannel,
  updateChannel
};