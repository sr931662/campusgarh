const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusGarh API',
      version: '1.0.0',
      description: 'API documentation for CampusGarh platform',
    },
    servers: [{ url: process.env.API_URL || 'http://localhost:5000/api/v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/v1/*.js'], // Path to route files
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };