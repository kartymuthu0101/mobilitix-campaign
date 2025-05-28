import { Sequelize } from 'sequelize';
import { dbConfig } from '../config/config.js';

/**
 * Create Sequelize instance with configuration
 */
export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        define: dbConfig.define,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Connect to the database
 * @returns {Promise<Sequelize>} - Sequelize instance
 */
export const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.info(`Database Connected`);
        return sequelize;
    } catch (error) {
        console.error(`Error connecting to PostgreSQL: ${error.message}`);
        throw error
        process.exit(1);
    }
};

export default {
    sequelize,
    connectDb
};