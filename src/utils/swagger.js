import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import { swaggerBaseUrl } from '../config/config.js';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Swagger options
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mobilytix Comviva',
            version: '1.0.0',
            description: 'API documentation of Mobilytix Backend',
        },
        servers: [
            {
                url: swaggerBaseUrl,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {}
        },
        security: [
            {
                bearerAuth: []
            }
        ],
    },
    apis: [path.resolve(__dirname, '../modules/**/*.route.js')], // Path to API routes
};

// Generate Swagger specification
const specs = swaggerJsdoc(options);

/**
 * Configure Swagger documentation for Express app
 * @param {Object} app - Express application
 */
export default (app) => {
    // Swagger UI page
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: "Mobilytix API Documentation"
    }));

    // Docs in JSON format
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};