import Politician from '../Model/Politician.js';

// @desc    Get all politicians (with optional search by name, party, or district)
// @route   GET /api/politicians
// @access  Public
export const getPoliticians = async (req, res) => {
  try {
    const { name, party, district } = req.query;
    let query = {};
    if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    if (party) query.party = party;
    if (district) query.district = district;

    const politicians = await Politician.find(query);
    res.status(200).json(politicians);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch politicians", error: error.message });
  }
};

// @desc    Get a single politician by ID
// @route   GET /api/politicians/:id
// @access  Public
export const getPoliticianById = async (req, res) => {
  try {
    const politician = await Politician.findById(req.params.id);
    if (!politician) return res.status(404).json({ message: "Politician not found" });
    res.status(200).json(politician);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving politician", error: error.message });
  }
};

// @desc    Create a new politician profile
// @route   POST /api/politicians
// @access  Private/Admin
export const createPolitician = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    else if (!req.body.name || !req.body.party || !req.body.district) {
      return res.status(400).json({ message: "Name, party, and district are required" });
    }
    const { name, party, district } = req.body;
    const newPolitician = await Politician.create({ name, party, district });
    res.status(201).json(newPolitician);
  } catch (error) {
    res.status(400).json({ message: "Invalid data", error: error.message });
  }
};

// @desc    Update politician details (e.g., changed party)
// @route   PUT /api/politicians/:id
// @access  Private/Admin
export const updatePolitician = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const updatedPolitician = await Politician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPolitician) return res.status(404).json({ message: "Politician not found" });
    res.status(200).json(updatedPolitician);
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error: error.message });
  }
};

// @desc    Delete a politician
// @route   DELETE /api/politicians/:id
// @access  Private/Admin
export const deletePolitician = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const politician = await Politician.findByIdAndDelete(req.params.id);
    if (!politician) return res.status(404).json({ message: "Politician not found" });
    res.status(200).json({ message: "Politician successfully removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting politician", error: error.message });
  }
};
