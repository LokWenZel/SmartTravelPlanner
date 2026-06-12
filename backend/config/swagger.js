const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Smart Travel Planner API",
    version: "1.0.0",
    description:
      "REST API for managing user travel records and combining saved trip data with real-time data from OpenWeatherMap, ExchangeRate API, and Google Places API.",
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
      description: "Third-party OpenWeatherMap integration",
    },
    {
      name: "Currency",
      description: "Third-party ExchangeRate API integration",
    },
    {
      name: "Places",
      description: "Third-party Google Places API integration",
    },
    {
      name: "Insights",
      description:
        "Combined trip insights using weather, currency, and places data",
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

    "/trips/{id}/currency": {
      get: {
        tags: ["Currency"],
        summary: "Convert a trip budget into another currency",
        description:
          "Retrieves a saved trip from MongoDB and converts its budget using live exchange rate data from ExchangeRate API.",
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
          {
            name: "to",
            in: "query",
            required: true,
            description: "Target three-letter currency code",
            schema: {
              type: "string",
              example: "JPY",
            },
          },
        ],
        responses: {
          200: {
            description: "Trip budget converted successfully",
          },
          400: {
            description: "Invalid or missing target currency",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "Trip not found",
          },
          502: {
            description: "Currency service error",
          },
        },
      },
    },

    "/trips/{id}/places": {
      get: {
        tags: ["Places"],
        summary: "Find places near a trip destination",
        description:
          "Retrieves a saved trip from MongoDB and searches for related places using Google Places API. Supported categories include attractions, restaurants, cafes, museums, and hotels.",
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
          {
            name: "category",
            in: "query",
            required: false,
            description: "Type of places to search for",
            schema: {
              type: "string",
              enum: [
                "attractions",
                "restaurants",
                "cafes",
                "museums",
                "hotels",
              ],
              example: "attractions",
            },
          },
        ],
        responses: {
          200: {
            description: "Trip places retrieved successfully",
          },
          400: {
            description: "Invalid Google Places request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "Trip not found",
          },
          429: {
            description: "Google Places rate limit reached",
          },
          502: {
            description: "Google Places service error",
          },
        },
      },
    },

    "/trips/{id}/insights": {
      get: {
        tags: ["Insights"],
        summary: "Get full trip insights",
        description:
          "Combines one saved trip with weather, currency conversion, and Google Places results. This endpoint demonstrates integration between the self-developed API and multiple third-party APIs.",
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
          {
            name: "to",
            in: "query",
            required: false,
            description: "Target currency for budget conversion",
            schema: {
              type: "string",
              example: "JPY",
            },
          },
          {
            name: "category",
            in: "query",
            required: false,
            description: "Google Places category",
            schema: {
              type: "string",
              enum: [
                "attractions",
                "restaurants",
                "cafes",
                "museums",
                "hotels",
              ],
              example: "attractions",
            },
          },
        ],
        responses: {
          200: {
            description:
              "Trip insights retrieved successfully. May include partial API errors if one external service fails.",
          },
          400: {
            description: "Invalid request",
          },
          401: {
            description: "Unauthorized",
          },
          404: {
            description: "Trip not found",
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
