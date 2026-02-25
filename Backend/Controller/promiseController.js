import PromiseModel from '../Model/Promise.js';
import Politician from '../Model/Politician.js';
import axios from 'axios';
import mongoose from 'mongoose';

// @desc    Fetch all promises (supports optional query filters)
// @route   GET /api/promises
export const getPromises = async (req, res) => {
  try {
    const promises = await PromiseModel.find().populate('politicianId');
    return res.status(200).json(promises);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch promises', error: error.message });
  }
};

// @desc    Create a new promise entry
// @route   POST /api/promises
export const createPromise = async (req, res) => {
  try {
    const { title, description, category, politicianId, politician, dueDate } = req.body;

    let finalPoliticianId = null;

    // If explicit politicianId provided, validate it's an ObjectId and exists
    if (politicianId) {
      if (!mongoose.Types.ObjectId.isValid(politicianId)) {
        // If it's a plain name string, try to find by name
        if (typeof politicianId === 'string') {
          const found = await Politician.findOne({ name: politicianId });
          if (found) finalPoliticianId = found._id;
          else return res.status(400).json({ message: 'politicianId must be a valid ObjectId or an existing politician name' });
        } else {
          return res.status(400).json({ message: 'Invalid politicianId format' });
        }
      } else {
        const exists = await Politician.findById(politicianId);
        if (!exists) return res.status(400).json({ message: 'No politician found for provided politicianId' });
        finalPoliticianId = exists._id;
      }
    }

    // If a politician object is provided, try to find-or-create
    if (!finalPoliticianId && politician && typeof politician === 'object') {
      const { name, party, district } = politician;
      if (!name || !party || !district) {
        return res.status(400).json({ message: 'politician object must include name, party and district' });
      }
      let found = await Politician.findOne({ name, district });
      if (!found) {
        found = await Politician.create({ name, party, district, position: politician.position, bio: politician.bio, profileImageUrl: politician.profileImageUrl });
      }
      finalPoliticianId = found._id;
    }

    const newPromise = new PromiseModel({ title, description, category, politicianId: finalPoliticianId, dueDate });
    const saved = await newPromise.save();
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create promise', error: error.message });
  }
};



// @desc    Delete a promise (Admin only)
// @route   DELETE /api/promises/:id
export const deletePromise = async (req, res) => {
  try {
    const promise = await PromiseModel.findByIdAndDelete(req.params.id);
    
    if (!promise) {
      return res.status(404).json({ message: "Promise not found" });
    }

    res.status(200).json({ message: "Promise successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting promise", error: error.message });
  }
};

// @desc    Search for news evidence automatically (Third-Party API Integration)
// @route   GET /api/promises/:id/search-evidence
export const searchEvidence = async (req, res) => {
  try {
    const promise = await PromiseModel.findById(req.params.id);
    if (!promise) {
      return res.status(404).json({ message: 'Promise not found' });
    }

    const apiKey = process.env.NEWS_API_KEY;
    const query = encodeURIComponent(`${promise.title} Sri Lanka`);

    const newsResponse = await axios.get(`https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`);

    const articles = (newsResponse.data.articles || []).slice(0, 3).map(article => ({
      title: article.title,
      url: article.url,
      source: article.source?.name,
      publishedAt: article.publishedAt
    }));

    return res.status(200).json({ message: 'Evidence retrieved successfully', evidenceFound: articles });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch third-party evidence', error: error.message });
  }
};

// @desc    Get 5 most recently updated promises (feed)
// @route   GET /api/promises/feed/recent
// @access  Public
export const getRecentUpdates = async (req, res) => {
  try {
    const recent = await PromiseModel.find().sort({ updatedAt: -1 }).limit(5).populate('politicianId');
    return res.status(200).json(recent);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch recent updates', error: error.message });
  }
};

// In Controller/promiseController.js

// @desc    Update the status (and optional evidence) of a promise
// @route   PATCH /api/promises/:id/status
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, evidenceUrl } = req.body;
    
    // 1. Update Database
    const updated = await PromiseModel.findByIdAndUpdate(
      id,
      { $set: { status, evidenceUrl } },
      { new: true }
    ).populate('politicianId'); // <--- Make sure to populate this!
    
    if (!updated) return res.status(404).json({ message: 'Promise not found' });

    // 2. TRIGGER REAL-TIME UPDATE (If Socket.io is running)
    if (req.io) {
        req.io.emit('promiseStatusChanged', updated);
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// @desc    Search Google Fact Check Tools for claims related to a promise
// @route   GET /api/promises/:id/fact-check
// @access  Public
export const factCheckPromise = async (req, res) => {
  try {
    const promise = await PromiseModel.findById(req.params.id).populate('politicianId');
    if (!promise) {
      return res.status(404).json({ message: 'Promise not found' });
    }

    const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
    
    // Validate API key exists
    if (!apiKey) {
      return res.status(500).json({ 
        message: 'Fact Check API key not configured', 
        error: 'GOOGLE_FACT_CHECK_API_KEY missing in .env' 
      });
    }

    // Get the politician's name if it exists, to make the search more accurate
    const politicianName = promise.politicianId ? promise.politicianId.name : '';
    const query = encodeURIComponent(`${politicianName} ${promise.title}`);

    // Google Fact Check API URL
    const factCheckUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${query}&key=${apiKey}`;
    const response = await axios.get(factCheckUrl);

    // Google returns an object with a 'claims' array, or an empty object if none found
    const claims = response.data.claims || [];

    // Format the top 3 results neatly for your frontend
    const formattedClaims = claims.slice(0, 3).map(claim => ({
      claimMade: claim.text,
      claimant: claim.claimant,
      factChecker: claim.claimReview[0]?.publisher?.name,
      rating: claim.claimReview[0]?.textualRating, // e.g., "False", "Partly True"
      url: claim.claimReview[0]?.url
    }));

    return res.status(200).json({ 
      message: 'Fact checks retrieved successfully', 
      factChecks: formattedClaims 
    });
  } catch (error) {
    // Check for API error details
    const status = error.response?.status || 500;
    const apiError = error.response?.data || error.message;
    return res.status(status).json({ 
      message: 'Failed to fetch fact checks', 
      error: apiError 
    });
  }
};

// @desc    Get promise statistics for a specific politician (Analytics)
// @route   GET /api/promises/stats/:politicianId
// @access  Public
export const getPromiseStats = async (req, res) => {
  try {
    const { politicianId } = req.params;

    // Advanced MongoDB Aggregation Pipeline
    const stats = await PromiseModel.aggregate([
      { 
        $match: { politicianId: new mongoose.Types.ObjectId(politicianId) } 
      },
      { 
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the data to be front-end friendly
    const formattedStats = {
      Achieved: 0,
      Broken: 0,
      Pending: 0,
      'In Progress': 0,
      total: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });

    res.status(200).json(formattedStats);
  } catch (error) {
    res.status(500).json({ message: "Error calculating statistics", error: error.message });
  }
};

// @desc    Update promise details (title, description, category, etc.)
// @route   PUT /api/promises/:id
// @access  Private/Admin
export const updatePromise = async (req, res) => {
  try {
    const updatedPromise = await PromiseModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPromise) {
      return res.status(404).json({ message: "Promise not found" });
    }
    
    res.status(200).json(updatedPromise);
  } catch (error) {
    res.status(400).json({ message: "Error updating promise", error: error.message });
  }
};