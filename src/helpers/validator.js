import statusCodes from './constants/httpStatusCodes.js';
import statusMsg from './constants/httpStatusMessage.js';
import { sendResponse } from './response.js';

// Validation options
const options = {
    // Generic option
    basic: {
        abortEarly: true,
        convert: true,
        allowUnknown: false, // Rejects unknown fields (no stripping)
        stripUnknown: false, // Disable silent stripping
        skipFunctions: true,
        noDefaults: false    // Ensure defaults are applied
    },
    
    // Options for Array of array
    array: {
        abortEarly: true,
        convert: true,
        skipFunctions: true,
        stripUnknown: {
            objects: true,
        },
    },
};

/**
 * Validate request body parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} schema - Joi validation schema
 * @returns {void}
 */
export const bodyParamValidation = (req, res, next, schema) => {
    if (!req.body) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            "Missing required inputs"
        );
    }
    
    const option = options.basic;
    const { value, error } = schema.validate(req.body, option);

    if (error && Object.keys(error).length > 0) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            error?.details
        );
    } else {
        req.body = value;
        next();
    }
};

/**
 * Validate request query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} schema - Joi validation schema
 * @returns {void}
 */
export const queryParamValidation = (req, res, next, schema) => {
    if (!req.query) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            "Missing required inputs"
        );
    }

    const option = options.basic;
    const { error } = schema.validate(req.query, option);
    
    if (error && Object.keys(error).length > 0) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            error
        );
    } else {
        if (req.bodyParam) return;
        else next();
    }
};

/**
 * Validate request path parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @param {Object} schema - Joi validation schema
 * @returns {void}
 */
export const paramValidation = (req, res, next, schema) => {
    if (!req.params) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            "Missing required path parameters"
        );
    }

    const option = options.basic;
    const { value, error } = schema.validate(req.params, option);
    
    if (error && Object.keys(error).length > 0) {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            error?.details
        );
    } else {
        req.params = value;
        next();
    }
};

export default {
    bodyParamValidation,
    queryParamValidation,
    paramValidation
};