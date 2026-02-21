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