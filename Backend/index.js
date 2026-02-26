import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./Routes/userRoutes.js";
import newsRoutes from "./Routes/newsRoutes.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import promiseRoutes from "./Routes/promiseRoutes.js";
import politicianRoutes from "./Routes/politicianRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import sessionRoutes from "./Routes/sessionRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();

const app = express();

// CORS Configuration
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

// Swagger setup
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Backend API",
    version: "1.0.0",
    description: "Minimal API docs",
  },
  servers: [
    { url: `http://localhost:${PORT}` }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./Routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

// Register routes
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/promises", promiseRoutes);
app.use("/api/politicians", politicianRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, family: 4 })
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });