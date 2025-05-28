import axios from 'axios';
import { interServiceApiKey } from '../config/config.js';
import { decrypt, encrypt } from '../utils/encryption.js';

export default class BaseInterServiceCommunication {
    /**
     * @param {string} baseURL - Base URL of the target service
     * @param {object} config - Optional custom config
     */
    constructor(baseURL, config = {}) {
        this.apiKey = interServiceApiKey;

        this.http = axios.create({
            baseURL,
            headers: {
                'x-api-key': this.apiKey,
                ...config.headers,
            },
            ...config,
        });

        this.http.interceptors.request.use(
            async config => {
                try {
                    // Encrypt only if data exists and it's a POST/PUT/PATCH request
                    if (config.data && ['post', 'put', 'patch'].includes(config.method)) {
                        const encrypted = await encrypt(config.data);
                        config.data = { input: encrypted };
                        config.headers['Content-Type'] = 'application/json'; // ensure correct content type
                    }
                    return config;
                } catch (err) {
                    console.error(`[ENCRYPTION ERROR] ${config?.url}:`, err.message);
                    return Promise.reject(err);
                }
            },
            error => {
                return Promise.reject(error);
            }
        );

        this.http.interceptors.response.use(
            async res => {
                try {
                    if (res?.data && typeof res.data == "string") {
                        const decrypted = await decrypt(res.data);
                        res.data = decrypted;
                    }
                    return res;
                } catch (err) {
                    console.error(`[DECRYPTION ERROR] ${res?.config?.url}:`, err.message);
                    return Promise.reject(err);
                }
            },
            async err => {
                try {
                    const encryptedData = err?.response?.data;
                    if (encryptedData) {
                        const decrypted = await decrypt(encryptedData);
                        err.response.data = decrypted; // overwrite encrypted error response
                    }
                } catch (decryptionErr) {
                    console.error(`[DECRYPTION ERROR - FAILSAFE] ${err?.config?.url}:`, decryptionErr.message);
                }

                console.error(`[HTTP ERROR] ${err?.config?.url}:`, err.message);
                return Promise.reject(err);
            }
        );
    }

    get(url, config = {}) {
        return this.http.get(url, config);
    }

    post(url, data, config = {}) {
        return this.http.post(url, data, config);
    }

    put(url, data, config = {}) {
        return this.http.put(url, data, config);
    }

    delete(url, config = {}) {
        return this.http.delete(url, config);
    }
}
