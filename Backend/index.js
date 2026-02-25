import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./Routes/userRoutes.js";
import promiseRoutes from "./Routes/promiseRoutes.js";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import politicianRoutes from "./Routes/politicianRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB then register routes and start server
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, family: 4 })
  .then(() => {
    console.log("MongoDB Connected");

    // Register routes after DB connection (ensures models/populate work)
    app.use("/api/users", userRoutes);
    app.use("/api/promises", promiseRoutes);
    app.use("/api/politicians", politicianRoutes);
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Start server when DB is available
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message || err);
    console.error(err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;

// Minimal Swagger setup
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Backend API",
    version: "1.0.0",
    description: "Minimal API docs",
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterUser: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string" },
          phone: { type: "string" },
          district: { type: "string" },
          role: { type: "string" }
        },
        required: ["name", "email", "password", "phone"]
      },
      LoginUser: {
        type: "object",
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" }
        },
        required: ["email", "password"]
      },
      PromiseCreate: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          dueDate: { type: "string", format: "date" }
        },
        required: ["title"]
      }
    }
  }
};

const options = {
  swaggerDefinition,
  // Scan route files for JSDoc OpenAPI comments
  apis: ["./Routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

// Note: routes and server start are performed after DB connection above.
