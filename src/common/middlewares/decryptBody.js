const { isEncryptionEnabled } = require("../../config/config");
const { decrypt } = require("../../utils/encryption");

const decryptBody = async (req, res, next) => {
    try {
        if (req.body && typeof req.body?.input == 'string')
            req.body = await decrypt(req.body?.input)
        else if (isEncryptionEnabled) {
            req.body = null;
        }
        next();
    } catch (error) {
        console.error("Error in Decrypting BODY:", (error))
        next();
    }
}

module.exports = decryptBody;