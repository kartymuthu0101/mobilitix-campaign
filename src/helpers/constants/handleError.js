const { sendResponse } = require("../response");
const statusCodes = require("./httpStatusCodes");

const errHandle = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
        return sendResponse(
            req,
            res,
            statusCodes.HTTP_INTERNAL_SERVER_ERROR,
            error.message,
            {},
            error
        );
    });
};

module.exports = {
    errHandle,
};