const CryptoJS = require('crypto-js');
const { encryptKey } = require('../config/config');

async function encrypt(data) {
    return new Promise((resolve, reject) => {
        try {
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                encryptKey
            ).toString();
            resolve(encryptedData);
        } catch (error) {
            console.error("Encryption Failed", error);
            reject(error);
        }
    });
}

async function decrypt(encryptedData) {
    return new Promise((resolve, reject) => {
        try {
            const bytes = CryptoJS.AES.decrypt(
                encryptedData,
                encryptKey
            );
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) {
                throw new Error("Decryption failed - possibly wrong key");
            }

            resolve(JSON.parse(decryptedData));
        } catch (error) {
            console.error("Decryption Failed", error);
            reject(error);
        }
    });
}

module.exports = {
    encrypt,
    decrypt
};