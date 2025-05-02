const Joi = require('joi');
const { bodyParamValidation, queryParamValidation } = require('../../helpers/validator.js');
const { MASTER_DATA_TYPES } = require('../../helpers/constants/index.js');

const createMasterData = (req, res, next) => {
  const schema = Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required(),
    type: Joi.string()
      .valid(...Object.values(MASTER_DATA_TYPES))
      .required(),
  });
  return bodyParamValidation(req, res, next, schema)
}

const getAll = (req, res, next) => {
  const schema = Joi.object({
    page: Joi.string().optional(),
    limit: Joi.string().default(10),
    type: Joi.string()
      .valid(...Object.values(MASTER_DATA_TYPES)).required()
  });
  return queryParamValidation(req, res, next, schema)
}

module.exports = {
  createMasterData,
  getAll
}