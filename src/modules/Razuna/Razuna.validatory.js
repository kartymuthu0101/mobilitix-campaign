const Joi = require('joi');
const { bodyParamValidation } = require('../../helpers/validator.js');

const createChannel = (req, res, next) => {
  const schema = Joi.object({
    channel_name: Joi.string().required(),
    description: Joi.string().optional(),
    status: Joi.string().required(),
  });
  return bodyParamValidation(req, res, next, schema)
}

module.exports = {
    createChannel
}