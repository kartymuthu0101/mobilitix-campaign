import Joi from 'joi';
import { bodyParamValidation, queryParamValidation } from '../../helpers/validator.js';
import { MASTER_DATA_TYPES } from '../../helpers/constants/index.js';

/**
 * Validate create master data request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const createMasterData = (req, res, next) => {
  const schema = Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required(),
    type: Joi.string()
      .valid(...Object.values(MASTER_DATA_TYPES))
      .required(),
  });
  
  return bodyParamValidation(req, res, next, schema);
};

/**
 * Validate get all master data query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const getAll = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.string().optional(),
    limit: Joi.string().default('10'),
    type: Joi.string()
      .valid(...Object.values(MASTER_DATA_TYPES))
      .required()
  });
  
  return queryParamValidation(req, res, next, schema);
};

/**
 * Validate update master data request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const updateMasterData = (req, res, next) => {
  const schema = Joi.object({
    value: Joi.string().required(),
  });
  
  return bodyParamValidation(req, res, next, schema);
};

/**
 * Validate bulk upsert master data request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const bulkUpsertMasterData = (req, res, next) => {
  const dataItemSchema = Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required(),
    type: Joi.string()
      .valid(...Object.values(MASTER_DATA_TYPES))
      .required(),
  });
  
  const schema = Joi.object({
    data: Joi.array()
      .items(dataItemSchema)
      .min(1)
      .required()
  });
  
  return bodyParamValidation(req, res, next, schema);
};

export default {
  createMasterData,
  getAll,
  updateMasterData,
  bulkUpsertMasterData
};