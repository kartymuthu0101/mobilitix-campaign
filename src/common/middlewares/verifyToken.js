import jwt from 'jsonwebtoken';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import { sendResponse } from '../../helpers/response.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import { interServiceApiKey } from '../../config/config.js';

// Error response constants
const unAuthorizedResponse = {
    status: statusCodes.HTTP_UNAUTHORIZED,
    message: "unauthorized.",
};

const invalidTokenResponse = {
    status: statusCodes.HTTP_UNAUTHORIZED,
    message: "Invalid token."
};

/**
 * Middleware to verify JWT token from Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req?.headers?.["authorization"];

        if (!authHeader) {
            return next();
        }

        const token = authHeader.includes("Bearer") ? authHeader.split(" ")[1] : authHeader;
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return next();
            }
            req.user = user;
            return next();
        });
    } catch (err) {
        console.error("Auth token verification error:", err.message);
        return sendResponse(req, res, statusCodes.HTTP_UNAUTHORIZED, statusMsg[401]);
    }
};

/**
 * Middleware to check if user has required permission
 * @param {string} requiredPermission - Permission to check
 * @returns {Function} - Express middleware function
 */
export const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        const apiKey = req?.headers?.['x-api-key'];

        if (apiKey === interServiceApiKey)
            return next();
        // if user not authenticated
        if (!req?.user?.id)
            return sendResponse(req, res, statusCodes.HTTP_UNAUTHORIZED, statusMsg[401]);

        // If not any specific permission
        if (!requiredPermission || !requiredPermission.length)
            return next()


        if (!Array.isArray(requiredPermission))
            requiredPermission = [requiredPermission]

        const permissions = req.user?.permissions || [];

        if (
            requiredPermission.some(v => {
                let newPer = null
                if (v.includes(":"))
                    newPer = v.split(":")[0];
                if (newPer)
                    return permissions.includes(v) || permissions.includes(newPer)
                return permissions.includes(v)
            })
        ) {
            // if (!permissions.includes(requiredPermission)) {
            return next();
        }
        return sendResponse(req, res, statusCodes.HTTP_FORBIDDEN, statusMsg[403]);

        // next();
    };
};

export default {
    verifyToken,
    checkPermission
};