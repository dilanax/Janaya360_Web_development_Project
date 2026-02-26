import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./Routes/userRoutes.js";
import newsRoutes from "./Routes/newsRoutes.js";
import feedbackRoutes from "./Routes/feedbackRoutes.js";
import politicianRoutes from "./Routes/politicianRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import sessionRoutes from "./Routes/sessionRoutes.js";
import notificationRoutes from "./Routes/notificationRoutes.js";

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
app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/politicians", politicianRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/notifications", notificationRoutes);

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

