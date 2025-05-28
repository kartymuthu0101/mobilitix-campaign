import { isEncryptionEnabled } from '../config/config.js';
import { encrypt } from '../utils/encryption.js';

/**
 * Send formatted response to client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Response message
 * @param {Object|Array} data - Response data
 * @param {Error} [error] - Error object (if applicable)
 * @returns {Promise<Object>} - Express response
 */
export const sendResponse = async (req, res, status, message, data, error) => {
    try {
        if (error) {
            console.error("Error in response:", error);
            message = error?.message || error;
        }

        // Check if encryption is requested via query parameter
        const { isEnc = 1 } = req?.query || {};

        // Prepare response object
        const response = {
            status,
            message,
            data,
        };

        // Skip encryption if disabled globally or in request
        if (!+isEnc || !isEncryptionEnabled) {
            return res.status(status).json(response);
        }

        // Encrypt response
        const encryptedResponse = await encrypt(response);
        return res.status(status).send(encryptedResponse);
    } catch (error) {
        console.error('Encryption failed:', error);

        // Fallback to unencrypted response
        return res.status(status).json({
            status,
            message,
            data,
            _warning: 'Encryption failed'
        });
    }
};

export default {
    sendResponse
};