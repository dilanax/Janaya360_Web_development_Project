import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  politicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Politician",
    required: true
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true
  },
  status: {
    type: String,
    enum: ["Present", "Absent", "Excused"],
    required: true
  }
}, { timestamps: true });

// ❗ Prevent duplicate attendance for same politician in same session
attendanceSchema.index({ politicianId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);