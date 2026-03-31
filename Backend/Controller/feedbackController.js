import Feedback from "../Model/Feedback.js";
import axios from "axios";
import mongoose from "mongoose";

const ALLOWED_FEEDBACK_TYPES = [
  "Opinion",
  "Complaint",
  "Suggestion",
  "Evidence"
];

const ALLOWED_DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa",
  "Badulla","Monaragala","Ratnapura","Kegalle"
];

/**
 * Sentiment analysis using external API
 */
const analyzeSentiment = async (text) => {
  try {
    const response = await axios.post(
      "http://text-processing.com/api/sentiment/",
      new URLSearchParams({ text }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return {
      type: response.data.label, // pos / neg / neutral
      score: response.data.probability.pos,
    };
  } catch (error) {
    console.log("Sentiment API error:", error.message);
    return { type: "neutral", score: 0 };
  }
};

/**
 * CREATE FEEDBACK
 */
export const createFeedback = async (req, res) => {
  try {
    const {
      comment,
      citizenName,
      feedbackType,
      district,
    } = req.body;

    // ✅ Third‑party Sentiment API
    const sentimentResult = await analyzeSentiment(comment);

    const feedback = await Feedback.create({
      promiseId: req.params.promiseId,
      comment,
      citizenName,
      feedbackType,
      district,
      sentiment: sentimentResult.type,
      sentimentScore: sentimentResult.score,
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * GET FEEDBACK BY PROMISE
 */
export const getFeedbackByPromise = async (req, res) => {
  try {
    const feedback = await Feedback.find({
      promiseId: req.params.promiseId,
    }).populate("userId", "name");

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * VOTE FEEDBACK
 */
export const voteFeedback = async (req, res) => {
  try {
    const { type } = req.body; // up or down

    const feedback = await Feedback.findById(req.params.feedbackId);

    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    if (type === "up") feedback.upvotes++;
    if (type === "down") feedback.downvotes++;

    await feedback.save();

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * UPDATE FEEDBACK
 */

export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      comment,
      citizenName,
      feedbackType,
      district
    } = req.body;

    /* ───────── VALIDATION START ───────── */

    // ✅ Comment validation
    if (comment !== undefined) {
      if (!comment.trim()) {
        return res.status(400).json({
          message: "Comment cannot be empty"
        });
      }

      if (comment.length > 300) {
        return res.status(400).json({
          message: "Comment must be under 300 characters"
        });
      }
    }

    // ✅ Citizen name validation
    if (
      citizenName !== undefined &&
      typeof citizenName !== "string"
    ) {
      return res.status(400).json({
        message: "Citizen name must be a text value"
      });
    }

    // ✅ Feedback type validation
    if (
      feedbackType !== undefined &&
      !ALLOWED_FEEDBACK_TYPES.includes(feedbackType)
    ) {
      return res.status(400).json({
        message: "Invalid feedback type"
      });
    }

    // ✅ District validation
    if (
      district !== undefined &&
      !ALLOWED_DISTRICTS.includes(district)
    ) {
      return res.status(400).json({
        message: "Invalid district"
      });
    }

    /* ───────── VALIDATION END ───────── */

    // ✅ Recalculate sentiment only if comment changes
    let sentimentData = {};
    if (comment !== undefined) {
      const sentimentResult = await analyzeSentiment(comment);
      sentimentData = {
        sentiment: sentimentResult.type,
        sentimentScore: sentimentResult.score,
      };
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        ...(comment !== undefined && { comment }),
        ...(citizenName !== undefined && { citizenName }),
        ...(feedbackType !== undefined && { feedbackType }),
        ...(district !== undefined && { district }),
        ...sentimentData,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        message: "Feedback not found"
      });
    }

    res.status(200).json(updatedFeedback);

  } catch (error) {
    console.error("Update Feedback Error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * DELETE FEEDBACK
 */
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: "Not found" });
    }

    // ✅ Public delete allowed for demo
    await feedback.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};