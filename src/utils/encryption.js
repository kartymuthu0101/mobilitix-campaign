import CryptoJS from 'crypto-js';
import { encryptKey } from '../config/config.js';

/**
 * Encrypt data with AES
 * @param {Object|string} data - Data to encrypt
 * @returns {Promise<string>} - Encrypted string
 */
export const encrypt = async (data) => {
    return new Promise((resolve, reject) => {
        try {
            const encryptedData = CryptoJS.AES.encrypt(
                JSON.stringify(data),
                encryptKey
            ).toString();
            resolve(encryptedData);
        } catch (error) {
            console.error("Encryption Failed:", error);
            reject(error);
        }
    });
};

/**
 * Decrypt AES encrypted string
 * @param {string} encryptedData - Encrypted string
 * @returns {Promise<Object>} - Decrypted data
 */
export const decrypt = async (encryptedData) => {
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
            console.error("Decryption Failed:", error);
            reject(error);
        }
    });
};

export default {
    encrypt,
    decrypt
};