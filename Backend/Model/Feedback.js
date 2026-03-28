import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    promiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promise",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ allow anonymous citizens
    },
    comment: {
      type: String,
      required: true,
    },
    citizenName: {
    type: String,
    },

   feedbackType: {
    type: String,
   },

  district: {
  type: String,
   },
    evidenceUrl: {
      type: String,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },

    // ⭐ NEW FIELDS FOR SENTIMENT API
    sentiment: {
      type: String,
      default: "neutral",
    },
    sentimentScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);