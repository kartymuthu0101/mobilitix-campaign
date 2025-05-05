const { Sequelize } = require('sequelize');
const { dbConfig } = require('../config/config.js');

const sequelize = new Sequelize(
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

const connectDb = async () => {
    try {
        await sequelize.authenticate();
        console.info(`Database Connected`);
        return sequelize;
    } catch (error) {
        console.error(`Error connecting to PostgreSQL: ${error.message}`);
        process.exit(1);
    }
};

module.exports = {
    connectDb,
    sequelize
};