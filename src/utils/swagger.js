const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const { swaggerBaseUrl } = require('../config/config');

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
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            },
            "schemas": {}
        },
        "security": [
            {
                "bearerAuth": []
            }
        ],
    },
    apis: [path.resolve(__dirname, '../modules/**/*.route.js')], // Path to your API routes
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
    // Swagger page
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

    // Docs in JSON format
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(specs);
    });
};