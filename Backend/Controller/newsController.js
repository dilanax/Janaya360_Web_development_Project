import axios from "axios";
import News from "../Model/News.js";

const decodeHtml = (value = "") =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

const parseTag = (block, tag) => {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : "";
};

const parseSource = (block) => {
  const match = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i);
  return match ? decodeHtml(match[1].trim()) : "Google News RSS";
};

const mapGoogleRssToArticles = (xml) => {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return items.slice(0, 12).map((item, index) => ({
    title: parseTag(item, "title") || `Latest political update ${index + 1}`,
    description: parseTag(item, "description") || "Live political update from RSS feed.",
    content: parseTag(item, "description") || "",
    url: parseTag(item, "link"),
    image: "",
    publishedAt: parseTag(item, "pubDate"),
    source: {
      name: parseSource(item),
    },
  }));
};

// ===============================
// GET ALL NEWS (ADMIN)
// ===============================
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    return res.json(news);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch news list",
      error: error.message,
    });
  }
};

export const getPublicNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    return res.json(news);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch public news list",
      error: error.message,
    });
  }
};

export const createNews = async (req, res) => {
  try {
    const { title, description, url, image, publishedAt, source, politician } = req.body;

    if (!title || !source) {
      return res.status(400).json({ message: "Title and source are required" });
    }

    const news = await News.create({
      title: title.trim(),
      description: description || "",
      url: url || "",
      image: image || "",
      publishedAt: publishedAt || null,
      source: source.trim(),
      politician: politician || "",
    });

    return res.status(201).json({
      message: "News created successfully",
      news,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create news",
    });
  }
};

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
    if (process.env.NEWS_API_KEY) {
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

        if (Array.isArray(response.data?.articles) && response.data.articles.length > 0) {
          return res.json(response.data);
        }
      } catch (gnewsError) {
        console.log("GNEWS TRENDS ERROR:", gnewsError.response?.data || gnewsError.message);
      }
    }

    // Fallback live feed (no API key required)
    const rssResponse = await axios.get(
      "https://news.google.com/rss/search?q=Sri+Lanka+politics&hl=en-US&gl=US&ceid=US:en",
      { timeout: 8000 }
    );

    const fallbackArticles = mapGoogleRssToArticles(rssResponse.data);
    return res.json({
      source: "google-rss-fallback",
      totalArticles: fallbackArticles.length,
      articles: fallbackArticles,
    });
  } catch (error) {
    console.log("LIVE NEWS FALLBACK ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Failed to fetch trends",
      error: error.response?.data || error.message,
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
// =============================
// UPDATE LINKED NEWS (Admin Only)
// =============================
export const updateLinkedNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    // Update allowed fields
    news.title = req.body.title || news.title;
    news.description = req.body.description || news.description;
    news.url = req.body.url || news.url;
    news.politician = req.body.politician || news.politician;

    const updatedNews = await news.save();

    res.json({
      message: "News updated successfully",
      news: updatedNews
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
