import { sendResponse } from '../response.js';
import statusCodes from './httpStatusCodes.js';

/**
 * Error handling middleware factory
 * @param {Function} fn - Route handler function
 * @returns {Function} - Express middleware function
 */
export const errHandle = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next))
        .catch(error => {
            console.error('Error caught by error handler:', error);
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

/**
 * Not found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
    return sendResponse(
        req,
        res,
        statusCodes.HTTP_NOT_FOUND,
        `Route not found: ${req.method} ${req.originalUrl}`,
        {}
    );
};

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const globalErrorHandler = (err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Default to 500 internal server error
    const statusCode = err.statusCode || statusCodes.HTTP_INTERNAL_SERVER_ERROR;
    
    return sendResponse(
        req,
        res,
        statusCode,
        err.message || 'Internal Server Error',
        {},
        err
    );
};

export default {
    errHandle,
    notFoundHandler,
    globalErrorHandler
};