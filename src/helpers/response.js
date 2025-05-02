const { isEncryptionEnabled } = require("../config/config.js");
const { encrypt } = require("../utils/encryption.js");

const sendResponse = async (req, res, status, message, data, error) => {
    try {
        if (error) {
            console.error("Error In response", error)
            message = error?.message || error
        }
        const { isEnc = 1 } = req?.query || {};
        const response = {
            status,
            message,
            data,
        };
        if (!+isEnc || !isEncryptionEnabled) {
            return res.status(status).json(response);
        }

        const encryptedResponse = await encrypt(response)

        return res.status(status).send(encryptedResponse);

    } catch (error) {
        console.error('Encryption failed:', error);

        return res.status(status).json({
            status,
            message,
            data,
            _warning: 'Encryption failed'
        });
    }
};

module.exports = {
    sendResponse,
}