import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./Routes/userRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import politicianRoutes from "./Routes/politicianRoutes.js";
import sessionRoutes from "./Routes/sessionRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/attendance",attendanceRoutes);
app.use("/api/politicians", politicianRoutes);
app.use("/api/sessions", sessionRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
