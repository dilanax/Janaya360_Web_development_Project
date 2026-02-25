import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import newsRoutes from "./Routes/newsRoutes.js";
import userRoutes from "./Routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use("/api/users", userRoutes);
app.use("/api/news", newsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));