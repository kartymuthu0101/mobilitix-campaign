module.exports = {
    port: process.env.PORT,
    environment: process.env.NODE_ENV,
    dbConfig: {
        dialect: process.env.DB_CONNECTION || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_DATABASE,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true // This adds deletedAt for soft deletes
        }
    },
    encryptKey: process.env.ENCRYPTION_KEY,
    swaggerBaseUrl: process.env.SWAGGER_BASE_URL,
    isEncryptionEnabled: +process.env.IS_ENCRYPTION_ENABLE
}