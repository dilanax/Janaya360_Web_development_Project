import mongoose from "mongoose";

const politicianSchema = new mongoose.Schema({
  name: String,
  party: String,
  district: String
});

export default mongoose.model("Politician", politicianSchema);