import { sequelize, connectDb } from '../utils/connectDb.js';

/**
 * Health check endpoint handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const healthcheck = async (req, res) => {
    try {
        // Check DB connection
        try {
            await sequelize.authenticate();
        } catch (error) {
            console.warn('Database connection issue, attempting to reconnect:', error.message);
            await connectDb(); // Reconnect if not connected
        }

        // Return health status
        res.status(200).json({
            status: 'ok',
            db: 'connected',
            test: "test",
            uptime: process.uptime(),
            timestamp: new Date(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        console.error('Health check failed:', error);

        res.status(500).json({
            status: 'error',
            db: 'disconnected',
            message: error.message,
            timestamp: new Date()
        });
    }
};

export default healthcheck;