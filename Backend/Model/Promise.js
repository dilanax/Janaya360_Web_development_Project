import mongoose from 'mongoose';

const promiseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Economy', 'Education', 'Health', 'Infrastructure'], 
    default: 'Education'
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Achieved', 'Broken'], 
    default: 'Pending' 
  },
  politicianId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Politician'
  },
  dueDate: { type: Date },
  evidenceUrl: { type: String }
}, { timestamps: true });

export default mongoose.model('Promise', promiseSchema);