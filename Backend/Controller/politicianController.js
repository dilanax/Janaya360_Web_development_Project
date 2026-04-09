import Politician from "../Model/Politician.js";

const normalizePoliticianName = (name = "") => {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/rajapaksha/g, "rajapaksa")
    .replace(/wickremeslinghe/g, "wickremesinghe")
    .replace(/wickremaasinghe/g, "wickremesinghe");
};

const hasUsableImage = (value = "") => {
  if (!value || typeof value !== "string") return false;
  if (value.includes("example.com")) return false;
  return /^https?:\/\//i.test(value);
};

const politicianQualityScore = (politician) => {
  let score = 0;

  if (politician?.name) score += 4;
  if (politician?.district) score += 2;
  if (politician?.position) score += 2;
  if (politician?.bio) score += 3;
  if (hasUsableImage(politician?.profileImageUrl)) score += 4;
  if (politician?.updatedAt) score += 1;

  return score;
};

/* ================= CREATE ================= */
// Admin Only
export const createPolitician = async (req, res) => {
  try {

    const politician = await Politician.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({
      message: "Politician created successfully",
      politician
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= READ ALL ================= */
export const getAllPoliticians = async (req, res) => {
  try {
    const politicians = await Politician.find().sort({ updatedAt: -1, createdAt: -1 });

    const uniquePoliticians = [];
    const seenByCanonicalName = new Map();

    for (const politician of politicians) {
      const canonicalName = normalizePoliticianName(politician.name);
      const existingIndex = seenByCanonicalName.get(canonicalName);

      if (existingIndex === undefined) {
        seenByCanonicalName.set(canonicalName, uniquePoliticians.length);
        uniquePoliticians.push(politician);
        continue;
      }

      const currentBest = uniquePoliticians[existingIndex];
      const nextScore = politicianQualityScore(politician);
      const currentScore = politicianQualityScore(currentBest);

      if (nextScore > currentScore) {
        uniquePoliticians[existingIndex] = politician;
      }
    }

    uniquePoliticians.sort((left, right) => left.name.localeCompare(right.name));

    res.json(uniquePoliticians);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= READ ONE ================= */
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


/* ================= UPDATE ================= */
// Admin Only
export const updatePolitician = async (req, res) => {
  try {

    const politician = await Politician.findById(req.params.id);

    if (!politician) {
      return res.status(404).json({ message: "Politician not found" });
    }

    politician.name = req.body.name || politician.name;
    politician.party = req.body.party || politician.party;
    politician.district = req.body.district || politician.district;
    politician.position = req.body.position || politician.position;
    politician.bio = req.body.bio || politician.bio;
    politician.profileImageUrl = req.body.profileImageUrl || politician.profileImageUrl;

    const updated = await politician.save();

    res.json({
      message: "Politician updated successfully",
      politician: updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/* ================= DELETE ================= */
// Admin Only
export const deletePolitician = async (req, res) => {
  try {

    const politician = await Politician.findById(req.params.id);

    if (!politician) {
      return res.status(404).json({ message: "Politician not found" });
    }

    await politician.deleteOne();

    res.json({ message: "Politician deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};