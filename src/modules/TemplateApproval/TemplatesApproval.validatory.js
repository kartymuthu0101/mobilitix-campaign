import Joi from 'joi';
import { bodyParamValidation } from '../../helpers/validator.js';
import {
  ESCALATION_MATRIX_PRIORITIES
} from '../../helpers/constants/index.js';

export const sendForApprovalInput = (req, res, next) => {
  const schema = Joi.object({
    attachments: Joi.string().optional(),
    notes: Joi.string().optional(),
    approver: Joi.string().email().required(),
    reviewer: Joi.string().email().optional(),
    priority: Joi.string()
      .valid(...Object.values(ESCALATION_MATRIX_PRIORITIES))
      .required(),
  });
  return bodyParamValidation(req, res, next, schema);
};

export const approveTemplateInput = (req, res, next) => {
  const schema = Joi.object({
    attachments: Joi.string().optional(),
    notes: Joi.string().optional(),
  });
  return bodyParamValidation(req, res, next, schema);
};

export const rejectTemplateInput = (req, res, next) => {
  const schema = Joi.object({
    attachments: Joi.string().optional(),
    notes: Joi.string().optional(),
  });
  return bodyParamValidation(req, res, next, schema);
};