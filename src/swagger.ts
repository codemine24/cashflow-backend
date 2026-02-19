import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Techtong",
    version: "1.0.0",
    description: "Documentation for all endpoints in the application",
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Local server",
    },
    {
      url: "http://52.64.200.190",
      description: "Remote server",
    },
  ],
  components: {
    securitySchemes: {
      AdminAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Enter the API key without 'Bearer' prefix",
      },
      UserAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Enter the API key without 'Bearer' prefix",
      },
      RetailerAuth: {
        type: "apiKey",
        in: "header",
        name: "Authorization",
        description: "Enter the API key without 'Bearer' prefix",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/app/**/*.swagger.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
