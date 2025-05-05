const { sequelize } = require("../utils/connectDb");
const { connectDb } = require("../utils/connectDb");

const healthcheck = async (req, res) => {
    try {
        // Check DB connection
        try {
            await sequelize.authenticate();
        } catch (error) {
            await connectDb(); // Reconnect if not connected
        }

        res.status(200).json({
            status: 'ok',
            db: 'connected',
            uptime: process.uptime(),
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            db: 'disconnected',
            message: error.message,
            timestamp: new Date()
        });
    }
};

module.exports = healthcheck;