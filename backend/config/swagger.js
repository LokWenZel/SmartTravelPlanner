const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Smart Travel Planner API",
    version: "1.0.0",
    description:
      "REST API for managing user travel records and combining saved trip data with real-time OpenWeather data.",
  },

  servers: [
    {
      url: "http://localhost:5000/api/v1",
      description: "Local development server",
    },
  ],

  tags: [
    {
      name: "Health",
      description: "API health check",
    },
    {
      name: "Authentication",
      description: "User registration, login and current user profile",
    },
    {
      name: "Trips",
      description: "User-specific travel records",
    },
    {
      name: "Weather",
      description: "Third-party OpenWeather integration",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },

    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: {
            type: "string",
            example: "Lok Wen Zel",
          },
          email: {
            type: "string",
            example: "lok@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
      },

      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            example: "lok@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
      },

      TripRequest: {
        type: "object",
        required: ["destination", "country", "startDate", "endDate"],
        properties: {
          destination: {
            type: "string",
            example: "George Town",
          },
          country: {
            type: "string",
            example: "Malaysia",
          },
          countryCode: {
            type: "string",
            example: "MY",
          },
          startDate: {
            type: "string",
            format: "date",
            example: "2026-07-01",
          },
          endDate: {
            type: "string",
            format: "date",
            example: "2026-07-04",
          },
          notes: {
            type: "string",
            example: "Visit heritage attractions and try local food.",
          },
          preferences: {
            type: "array",
            items: {
              type: "string",
            },
            example: ["food", "culture", "museums"],
          },
          budget: {
            type: "number",
            example: 1200,
          },
          currency: {
            type: "string",
            example: "MYR",
          },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Not authorized. No token provided.",
          },
        },
      },
    },
  },

  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check whether the API is running",
        responses: {
          200: {
            description: "API is running successfully",
          },
        },
      },
    },

    "/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RegisterRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
          },
          400: {
            description: "Missing or invalid registration data",
          },
          409: {
            description: "Email is already registered",
          },
        },
      },
    },

    "/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user and return JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
          },
          401: {
            description: "Invalid email or password",
          },
        },
      },
    },

    "/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current logged-in user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Current user returned successfully",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/trips": {
      get: {
        tags: ["Trips"],
        summary: "Get all trips owned by the logged-in user",
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: "Trips retrieved successfully",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },

      post: {
        tags: ["Trips"],
        summary: "Create a new trip",
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TripRequest",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Trip created successfully",
          },
          400: {
            description: "Invalid trip data",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/trips/{id}": {
      get: {
        tags: ["Trips"],
        summary: "Get one trip by ID",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB trip ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Trip retrieved successfully",
          },
          400: {
            description: "Invalid trip ID",
          },
          404: {
            description: "Trip not found",
          },
        },
      },

      put: {
        tags: ["Trips"],
        summary: "Update an existing trip",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB trip ID",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TripRequest",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Trip updated successfully",
          },
          400: {
            description: "Invalid trip data",
          },
          404: {
            description: "Trip not found",
          },
        },
      },

      delete: {
        tags: ["Trips"],
        summary: "Delete an existing trip",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB trip ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Trip deleted successfully",
          },
          400: {
            description: "Invalid trip ID",
          },
          404: {
            description: "Trip not found",
          },
        },
      },
    },

    "/trips/{id}/weather": {
      get: {
        tags: ["Weather"],
        summary: "Get saved trip data combined with current weather",
        description:
          "Retrieves one saved trip from MongoDB and combines it with real-time weather data from OpenWeather.",
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "MongoDB trip ID",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Trip and current weather retrieved successfully",
          },
          400: {
            description: "Invalid trip ID",
          },
          404: {
            description: "Trip or weather location not found",
          },
          502: {
            description: "Weather service error",
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;