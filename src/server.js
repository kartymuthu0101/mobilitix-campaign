import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './utils/connectDb.js';
import router from './routes/index.js';
import swagger from './utils/swagger.js';
import { port } from './config/config.js';
import cronJobs from './crons/index.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Start application server
 */
(async function server() {
    try {
        const app = express();

        // Connect to database
        await connectDb();

        // Middleware
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.use('/uploads', express.static(path.join(__dirname, './modules/Razuna/uploads')));

        // Setup Swagger
        swagger(app);
        cronJobs(app)

        // Enable CORS
        app.use(cors());

        // Routes
        app.use("/api", router);

        // Start server
        app.listen(port, () => console.info(`Server is running on port ${port}`));
    } catch (error) {
        console.error("SERVER ERROR:", error);
        process.exit(1);
    }
})();