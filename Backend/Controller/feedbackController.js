import Feedback from "../Model/Feedback.js";
import axios from "axios";
import mongoose from "mongoose";

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

    const feedback = await Feedback.create({
      promiseId: req.params.promiseId,
      comment,
      citizenName,
      feedbackType,
      district,
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
    const { comment, evidenceUrl } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      {
        ...(comment !== undefined && { comment }),
        ...(evidenceUrl !== undefined && { evidenceUrl }),
      },
      {
        new: true,          // ✅ return updated doc
        runValidators: true
      }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.status(200).json(updatedFeedback);
  } catch (err) {
    console.error("Update feedback error:", err);
    res.status(500).json({ message: err.message });
  }
};
``
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