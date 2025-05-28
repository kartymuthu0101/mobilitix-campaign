import { environment, isEncryptionEnabled } from '../../config/config.js';
import { decrypt } from '../../utils/encryption.js';

/**
 * Middleware to decrypt request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>}
 */
const decryptBody = async (req, res, next) => {
    try {
        // Check if body contains encrypted input
        if (req.body && typeof req.body?.input === 'string') {
            req.body = await decrypt(req.body?.input);
        }
        // If encryption is enabled but no encrypted input provided, set body to null
        else if (isEncryptionEnabled && !['development', 'staging'].includes(environment)) {
            req.body = null;
        }

        next();
    } catch (error) {
        console.error("Error in Decrypting BODY:", error);
        next();
    }
};

export default decryptBody;