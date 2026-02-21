import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  topic: {
    type: String,
    required: true
  }
});

export default mongoose.model("Session", sessionSchema);