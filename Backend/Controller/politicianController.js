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
    const newPolitician = await Politician.create(req.body);
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
    const politician = await Politician.findByIdAndDelete(req.params.id);
    if (!politician) return res.status(404).json({ message: "Politician not found" });
    
    res.status(200).json({ message: "Politician successfully removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting politician", error: error.message });
  }
};
import Politician from "../Model/Politician.js";

// CREATE Politician
export const createPolitician = async (req, res) => {
  try {
    const { name, party, district } = req.body;

    const politician = await Politician.create({
      name,
      party,
      district
    });

    res.status(201).json(politician);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET All Politicians
export const getAllPoliticians = async (req, res) => {
  try {
    const politicians = await Politician.find();
    res.json(politicians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Single Politician
export const getPoliticianById = async (req, res) => {
  try {
    const politician = await Politician.findById(req.params.id);

    if (!politician) {
      return res.status(404).json({ message: "Politician not found" });
    }

    res.json(politician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Politician
export const updatePolitician = async (req, res) => {
  try {
    const updated = await Politician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Politician not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE Politician
export const deletePolitician = async (req, res) => {
  try {
    const deleted = await Politician.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Politician not found" });
    }

    res.json({ message: "Politician deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
