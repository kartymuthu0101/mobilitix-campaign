const Joi = require('joi');
const { bodyParamValidation } = require('../../helpers/validator.js');

const userCreateInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(6).required(),
  });
  return bodyParamValidation(req, res, next, schema)
}

module.exports = {
  userCreateInput
}