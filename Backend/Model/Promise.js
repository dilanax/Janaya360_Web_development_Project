import mongoose from 'mongoose';

const PromiseHistorySchema = new mongoose.Schema({
    oldStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    reason: { type: String, trim: true },
    changedAt: { type: Date, default: Date.now }
}, { _id: false }); 

const PromiseSchema = new mongoose.Schema({
    politicianId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Politician', 
        required: [true, 'A promise must be linked to a Politician'] 
    },
    title: { 
        type: String, 
        required: [true, 'Promise title is required'], 
        trim: true,
        minlength: [5, 'Title must be at least 5 characters long'],
        maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: { 
        type: String, 
        required: [true, 'Promise description is required'],
        trim: true
    },
    category: { 
        type: String, 
        required: [true, 'Category is required'],
        enum: ['Economy', 'Education', 'Health', 'Infrastructure', 'Governance', 'Agriculture', 'Other'] 
    },
    
    // NEW: Added the District field for geo-filtering
    district: { 
        type: String, 
        default: 'National',
        trim: true
    },

    status: { 
        type: String, 
        enum: ['Pending', 'In-Progress', 'Kept', 'Broken'], 
        default: 'Pending' 
    },
    dueDate: { type: Date, default: null },
    evidenceUrl: {
        type: String,
        match: [/^https?:\/\/.+/, 'Please provide a valid URL for evidence'],
        default: null
    },
    evidenceNotes: { type: String, trim: true },
    history: [PromiseHistorySchema],

    // NEW: Tracking public community consensus
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }

}, { timestamps: true });

// Excellent performance optimization!
PromiseSchema.index({ politicianId: 1, status: 1 });
PromiseSchema.index({ category: 1 });
PromiseSchema.index({ district: 1 }); // Added index for fast district filtering

export default mongoose.model('Promise', PromiseSchema);