import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    url: String,
    image: String,
    publishedAt: Date,
    source: String,
    politician: String,
    linkedPromise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promise"
    }
  },
  { timestamps: true }
);

export default mongoose.model("News", newsSchema);