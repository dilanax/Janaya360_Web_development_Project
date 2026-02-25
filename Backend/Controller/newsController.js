import axios from "axios";
import News from "../Model/News.js";

// GET /api/news/:politicianName
export const getNewsByPolitician = async (req, res) => {
  try {
    const { politicianName } = req.params;

    console.log("Fetching news for:", politicianName);

    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: politicianName,
          apikey: process.env.NEWS_API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log("GNEWS ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "Error fetching news",
      error: error.response?.data || error.message
    });
  }
};

// GET /api/news/social/trends
export const getPoliticalTrends = async (req, res) => {
  try {
    const response = await axios.get(
      "https://gnews.io/api/v4/search",
      {
        params: {
          q: "Sri Lanka politics",
          apikey: process.env.NEWS_API_KEY
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log("TRENDS ERROR:", error.response?.data || error.message);

    res.status(500).json({
      message: "Error fetching trends",
      error: error.response?.data || error.message
    });
  }
};

// POST /api/news/verify/:id
export const verifyNewsForPromise = async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.create({
      ...req.body,
      linkedPromise: id
    });

    res.json({
      message: "News linked successfully",
      news
    });

  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// GET /api/news/archive/:id
export const getArchivedNews = async (req, res) => {
  try {
    const news = await News.find({ linkedPromise: req.params.id });

    res.json(news);

  } catch (error) {
    res.status(500).json({ message: "Error fetching archive" });
  }
};

// DELETE /api/news/link/:id
export const removeLinkedNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);

    res.json({ message: "News link removed" });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};