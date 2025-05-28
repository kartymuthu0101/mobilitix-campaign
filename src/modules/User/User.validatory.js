import Joi from 'joi';
import { bodyParamValidation } from '../../helpers/validator.js';

export const userCreateInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(6).required(),
  });
  return bodyParamValidation(req, res, next, schema);
};
