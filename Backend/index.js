import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./Routes/userRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import politicianRoutes from "./Routes/politicianRoutes.js";
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


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/politicians", politicianRoutes);
app.use("/api/sessions", sessionRoutes);

app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
