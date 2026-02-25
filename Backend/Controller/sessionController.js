import Session from "../Model/Session.js";

// CREATE Session
export const createSession = async (req, res) => {
  try {
    const { date, topic } = req.body;

    const session = await Session.create({
      date,
      topic
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET All Sessions
export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ date: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Single Session
export const getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Session
export const updateSession = async (req, res) => {
  try {
    const updated = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Session
export const deleteSession = async (req, res) => {
  try {
    const deleted = await Session.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};