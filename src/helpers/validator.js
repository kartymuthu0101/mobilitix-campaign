const statusCodes = require("./constants/httpStatusCodes.js")
const statusMsg = require("./constants/httpStatusMessage.js")
const { sendResponse } = require("./response.js")

const options = {
    // generic option
    basic: {
        // abortEarly: true,
        // convert: true,
        // // allowUnknown: true,
        // stripUnknown: true,
        // skipFunctions: true

        abortEarly: true,
        convert: true,
        allowUnknown: false, // 👈 Rejects unknown fields (no stripping)
        stripUnknown: false, // 👈 Disable silent stripping
        skipFunctions: true,
        noDefaults: false // 👈 Ensure defaults are applied (Joi default is false)

    },
    // Options for Array of array
    array: {
        abortEarly: true,
        convert: true,
        // allowUnknown: false,
        skipFunctions: true,
        stripUnknown: {
            objects: true,
        },
    },
};

const bodyParamValidation = (req, res, next, schema) => {
    if (!req.body)
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            "missing required inputs"
        );
    let option = options.basic;
    let { value, error } = schema.validate(req.body, option);

    if (error && Object.keys(error).length > 0) {
        sendResponse(
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

const queryParamValidation = (req, res, next, schema) => {
    if (!req.query)
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_BAD_REQUEST,
            statusMsg[400],
            "missing required inputs"
        );

    let option = options.basic;
    let { error } = schema.validate(req.query, option);
    if (error && Object.keys(error).length > 0) {
        sendResponse(
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

module.exports = {
    bodyParamValidation,
    queryParamValidation
}