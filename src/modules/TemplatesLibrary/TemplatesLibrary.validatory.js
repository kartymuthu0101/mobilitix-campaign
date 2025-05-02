const Joi = require('joi');
const { bodyParamValidation, queryParamValidation } = require('../../helpers/validator.js');
const { TEMPLATE_STATUS, CONTENT_BLOCK_TYPES, TEMPLATE_TYPE, FOLDER_LOCATION, CONTENT_BLOCK_TAGS, WHATSAPP_TEMPLATE_BUTTON_TYPE } = require('../../helpers/constants/index.js');

const userCreateInput = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().min(6).required(),
  });
  return bodyParamValidation(req, res, next, schema)
}

const folderCreateInput = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    parentId: Joi.string().hex().length(24).optional(),
    channelId: Joi.string().hex().length(24).required(),
    folderLocation: Joi.string()
      .valid(...Object.values(FOLDER_LOCATION))
      .when('parentId', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
    type: Joi.string()
      .valid(TEMPLATE_TYPE.FOLDER)
      .required(),
  });
  return bodyParamValidation(req, res, next, schema)
}

const folderListQueryValidation = (req, res, next) => {
  const schema = Joi.object({
    channelId: Joi.string().hex().length(24).required(),
    parentId: Joi.string().hex().length(24).optional(),
    folderLocation: Joi.string()
      .valid(...Object.values(FOLDER_LOCATION))
      .when('parentId', {
        is: Joi.exist(),
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
    search: Joi.string().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).default(10).optional(),
  });

  return queryParamValidation(req, res, next, schema);
};

const updateFolderPermissionsInput = (req, res, next) => {

  const schema = Joi.object({
    userIdsToAdd: Joi.array()
      .items(Joi.string().hex().length(24))
      .optional(),
    userIdsToRemove: Joi.array()
      .items(Joi.string().hex().length(24))
      .optional()
  }).custom((value, helpers) => {
    const add = value.userIdsToAdd || [];
    const remove = value.userIdsToRemove || [];

    if (add.length === 0 && remove.length === 0) {
      return helpers.error('any.custom', {
        message: 'At least one of userIdsToAdd or userIdsToRemove must have at least one item.'
      });
    }

    // Optional: Normalize undefined to empty array after validation
    value.userIdsToAdd = add;
    value.userIdsToRemove = remove;

    return value;
  });

  return bodyParamValidation(req, res, next, schema);
};

const blockSchema = Joi.object({
  type: Joi.string()
    .valid(...Object.values(CONTENT_BLOCK_TYPES))
    .required(),
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string().valid(...Object.values(CONTENT_BLOCK_TAGS)).required()).optional(),
  order: Joi.number().required(),
  templateId: Joi.string().hex().length(24).optional(),
  id: Joi.string().hex().length(24).optional(),
  buttonType: Joi.string().valid(...Object.values(WHATSAPP_TEMPLATE_BUTTON_TYPE)),
  url: Joi.string(),
  countryCode: Joi.string(),
  phoneNumber: Joi.string(),
});

const blocksArraySchema = Joi.array()
  .items(blockSchema)
  .min(1)
  .messages({
    'array.min': 'At least one block is required',
  });

const templateCreateInput = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    channelId: Joi.string().optional(),
    templateType: Joi.string().optional(),
    folderId: Joi.string().optional(),
    category: Joi.string().optional(),
    language: Joi.array().items(Joi.string()).optional(),
    layoutId: Joi.string().hex().length(24).optional(),
    blocks: blocksArraySchema.optional(),
    status: Joi.valid(TEMPLATE_STATUS.DRAFT).default(TEMPLATE_STATUS.DRAFT).empty(''),
    type: Joi.valid(TEMPLATE_TYPE.TEMPLATE).default(TEMPLATE_TYPE.TEMPLATE).empty(''),
  });
  return bodyParamValidation(req, res, next, schema)
}

const templateUpdateInput = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.string().hex().length(24).required(),
    name: Joi.string().trim().min(1).max(100).optional(),
    channelId: Joi.string().optional(),
    templateType: Joi.string().optional(),
    folderId: Joi.string().optional(),
    category: Joi.string().optional(),
    language: Joi.array().items(Joi.string()).optional(),
    layoutId: Joi.string().hex().length(24).optional(),
    blocks: blocksArraySchema.optional(),
  });
  return bodyParamValidation(req, res, next, schema)
}

module.exports = {
  userCreateInput,
  folderCreateInput,
  folderListQueryValidation,
  updateFolderPermissionsInput,
  templateCreateInput,
  templateUpdateInput
}