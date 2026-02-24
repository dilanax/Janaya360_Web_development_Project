import express from "express";
import {
  getAttendanceByPolitician,
  getAllSessions,
  recordAttendance,
  compareAttendance,
  updateAttendance
} from "../Controller/attendanceController.js";

const router = express.Router();

// Attendance routes
router.get("/attendance/:politicianId", getAttendanceByPolitician);
router.post("/attendance/record", recordAttendance);
router.get("/attendance/stats/compare", compareAttendance);
router.put("/attendance/:recordId", updateAttendance);

// Session routes
router.get("/parliament/sessions", getAllSessions);

export default router;