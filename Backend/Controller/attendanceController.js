import Attendance from "../Model/Attendance.js"
import Session from "../Model/Session.js";
import Politician from "../Model/Politician.js";


// GET /api/attendance/:politicianId
export const getAttendanceByPolitician = async (req, res) => {
  try {
    const { politicianId } = req.params;

    const records = await Attendance.find({ politicianId })
      .populate("sessionId", "date topic");

    if (!records.length) {
      return res.status(404).json({ message: "No attendance records found" });
    }

    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;

    const percentage = ((present / total) * 100).toFixed(2);

    res.json({
      politicianId,
      attendancePercentage: percentage,
      totalSessions: total,
      presentSessions: present,
      records
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET /api/parliament/sessions
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST /api/attendance/record
export const recordAttendance = async (req, res) => {
  try {
    const { politicianId, sessionId, status } = req.body;

    const attendance = await Attendance.create({
      politicianId,
      sessionId,
      status
    });

    res.status(201).json(attendance);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// GET /api/attendance/stats/compare?ids=id1,id2,id3
export const compareAttendance = async (req, res) => {
  try {
    const ids = req.query.ids.split(",");

    const results = [];

    for (let id of ids) {
      const records = await Attendance.find({ politicianId: id });

      const total = records.length;
      const present = records.filter(r => r.status === "Present").length;
      const percentage = total ? ((present / total) * 100).toFixed(2) : 0;

      const politician = await Politician.findById(id);

      results.push({
        politician: politician?.name,
        totalSessions: total,
        presentSessions: present,
        attendancePercentage: percentage
      });
    }

    res.json(results);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /api/attendance/:recordId
export const updateAttendance = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { status } = req.body;

    const updated = await Attendance.findByIdAndUpdate(
      recordId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json(updated);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};