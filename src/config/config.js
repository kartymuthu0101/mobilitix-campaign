module.exports = {
    port: process.env.PORT,
    environment: process.env.NODE_ENV,
    dbConfig: {
        uri: process.env.DB_URI
    },
    encryptKey: process.env.ENCRYPTION_KEY,
    swaggerBaseUrl: process.env.SWAGGER_BASE_URL,
    isEncryptionEnabled: +process.env.IS_ENCRYPTION_ENABLE
}