import mongoose from 'mongoose';

const politicianSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  party: { 
    type: String, 
    required: true,
    enum: ['SLPP', 'SJB', 'NPP', 'UNP', 'Other'] // Add relevant Sri Lankan parties
  },
  district: { 
    type: String, 
    required: true 
  },
  position: {
    type: String,
    default: 'Member of Parliament'
  },
  bio: { 
    type: String 
  },
  profileImageUrl: { 
    type: String 
  }
}, { timestamps: true });

export default mongoose.model('Politician', politicianSchema);