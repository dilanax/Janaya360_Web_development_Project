import axios from "axios";
import News from "../Model/News.js";

// ===============================
// GET LIVE NEWS FROM GNEWS
// ===============================
export const getNewsByPolitician = async (req, res) => {
  try {
    const { politicianName } = req.params;

    if (!process.env.NEWS_API_KEY) {
      return res.status(400).json({ message: "API Key missing" });
    }

    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: politicianName,
          apikey: process.env.NEWS_API_KEY,
        },
      }
    );

    return res.json(response.data);

  } catch (error) {
    console.log("GNEWS ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      message: "Failed to fetch news",
      error: error.response?.data || error.message,
    });
  }
};

// ===============================
// GET POLITICAL TRENDS
// ===============================
export const getPoliticalTrends = async (req, res) => {
  try {
    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: "Sri Lanka politics",
          apikey: process.env.NEWS_API_KEY,
        },
      }
    );

    return res.json(response.data);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch trends",
    });
  }
};

// ===============================
// LINK NEWS TO PROMISE
// ===============================
export const verifyNewsForPromise = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.create({
      title: req.body.title,
      description: req.body.description,
      url: req.body.url,
      image: req.body.image,
      publishedAt: req.body.publishedAt,
      source: req.body.source,
      politician: req.body.politician,
      linkedPromise: id,
    });

    return res.status(201).json({
      message: "News linked successfully",
      news,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Failed to link news",
    });
  }
};

// ===============================
// GET ARCHIVED NEWS
// ===============================
export const getArchivedNews = async (req, res) => {
  try {
    const news = await News.find({
      linkedPromise: req.params.id,
    });

    return res.json(news);

  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch archive",
    });
  }
};

// ===============================
// DELETE LINKED NEWS
// ===============================
export const removeLinkedNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "News not found",
      });
    }

    return res.json({
      message: "News link removed",
    });

  } catch (error) {
    return res.status(500).json({
      message: "Delete failed",
    });
  }
};