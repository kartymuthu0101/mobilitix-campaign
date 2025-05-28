/**
 * Application configuration
 */
export const port = process.env.PORT;
export const environment = process.env.NODE_ENV;
export const dbConfig = {
    dialect: process.env.DB_CONNECTION || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    logging: console.log,
    define: {
        timestamps: true,
        underscored: false, // Changed from true to false to match model definitions
        paranoid: false      // This adds deletedAt for soft deletes
    }
};
export const encryptKey = process.env.ENCRYPTION_KEY;
export const swaggerBaseUrl = process.env.SWAGGER_BASE_URL;
export const isEncryptionEnabled = +process.env.IS_ENCRYPTION_ENABLE;
export const interServiceApiKey = process.env.INTERSERVICE_API_KEY;
export const interServiceBaseUrl = {
    auth: process.env.AUTH_SERVICE_BASE_URL
}