import PromiseModel from '../Model/Promise.js';
import mongoose from 'mongoose';
import PoliticianModel from '../Model/Politician.js';
import axios from 'axios';

class PromiseController {
    // @desc    Get all promises (with filtering, sorting, and pagination)
    // @route   GET /api/promises
    // @access  Public
    async getAllPromises(req, res) {
        try {
            const { status, politicianId, category, limit = 20, page = 1, sort = 'createdAt', order = 'desc' } = req.query;
            
            // Build the query object dynamically
            const query = {};
            if (status) query.status = status;
            if (politicianId) query.politicianId = politicianId;
            if (category) query.category = category;

            // Calculate pagination offset
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const data = await PromiseModel.find(query)
                .limit(parseInt(limit))
                .skip(offset)
                .sort({ [sort]: order === 'desc' ? -1 : 1 })
                .populate('politicianId', 'name party district position');

            const count = await PromiseModel.countDocuments(query);

            res.status(200).json({ 
                success: true, 
                data, 
                pagination: { 
                    page: parseInt(page), 
                    limit: parseInt(limit), 
                    total: count,
                    totalPages: Math.ceil(count / parseInt(limit))
                } 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // @desc    Create a new promise
    // @route   POST /api/promises
    // @access  Private/Admin
    async createPromise(req, res) {
        try {
            const { title, description, category, dueDate, politicianId, politicianName } = req.body;

            let finalId = politicianId;

            // SMART LOGIC: If the user provided a name instead of an ID, look it up automatically!
            if (!finalId && politicianName) {
                const politician = await PoliticianModel.findOne({ name: politicianName });
                
                if (!politician) {
                    return res.status(404).json({ success: false, error: `Politician named '${politicianName}' not found.` });
                }
                finalId = politician._id;
            }

            // If neither an ID nor a valid Name was provided, reject the request
            if (!finalId) {
                return res.status(400).json({ success: false, error: 'You must provide either a politicianId or a politicianName' });
            }

            // Create the promise using the resolved ID
            const promise = await PromiseModel.create({
                title,
                description,
                category,
                dueDate,
                politicianId: finalId
            });

            res.status(201).json({ success: true, data: promise });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // @desc    Get a single promise by ID
    // @route   GET /api/promises/:id
    // @access  Public
    async getPromiseById(req, res) {
        try {
            const promise = await PromiseModel.findById(req.params.id)
                .populate('politicianId', 'name party profileImageUrl');
                
            if (!promise) return res.status(404).json({ success: false, error: 'Promise not found' });
            
            res.status(200).json({ success: true, data: promise });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // @desc    Update general promise details (Admin only)
    // @route   PUT /api/promises/:id
    // @access  Private/Admin
    async updatePromise(req, res) {
        try {
            const updatedPromise = await PromiseModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedPromise) return res.status(404).json({ success: false, error: 'Promise not found' });

            res.status(200).json({ success: true, data: updatedPromise });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // @desc    Update promise status & save to history log
    // @route   PATCH /api/promises/:id/status
    // @access  Private/Admin or Auditor
    async updateStatus(req, res) {
        try {
            const { status, reason, evidenceUrl, evidenceNotes } = req.body;
            const promise = await PromiseModel.findById(req.params.id);
            
            if (!promise) return res.status(404).json({ success: false, error: 'Promise not found' });

            // Push to history array before changing the main status
            promise.history.push({ 
                oldStatus: promise.status, 
                newStatus: status, 
                reason: reason || 'Status updated by auditor/admin' 
            });

            // Update the main fields
            promise.status = status;
            if (evidenceUrl) promise.evidenceUrl = evidenceUrl;
            if (evidenceNotes) promise.evidenceNotes = evidenceNotes;
            
            await promise.save();

            res.status(200).json({ success: true, data: promise });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // @desc    Delete a promise
    // @route   DELETE /api/promises/:id
    // @access  Private/Admin
    async deletePromise(req, res) {
        try {
            const promise = await PromiseModel.findByIdAndDelete(req.params.id);
            if (!promise) return res.status(404).json({ success: false, error: 'Promise not found' });
            
            res.status(200).json({ success: true, message: 'Promise successfully deleted' });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // @desc    Auto-search news for evidence based on promise title
    // @route   GET /api/promises/:id/search-evidence
    // @access  Private/Admin or Auditor
    async searchEvidence(req, res) {
        try {
            const promise = await PromiseModel.findById(req.params.id)
                .populate('politicianId', 'name');
            
            if (!promise) return res.status(404).json({ success: false, error: 'Promise not found' });

            // 🛡️ NEW SAFETY CHECK: Ensure the linked politician actually exists!
            if (!promise.politicianId) {
                return res.status(404).json({ success: false, error: 'The politician linked to this promise was deleted or does not exist.' });
            }

            // Create a smart search query
            const searchQuery = `${promise.politicianId.name} ${promise.title}`;
            
            console.log("SEARCHING NEWS FOR:", searchQuery); // <--- ADD THIS LINE!
            // Call the external News API
            const response = await axios.get(`https://newsapi.org/v2/everything`, {
                params: {
                    q: "Sri Lanka Economy", // <--- TEMPORARILY CHANGE THIS TO A HARDCODED STRING
                    sortBy: 'relevancy',
                    language: 'en',
                    apiKey: process.env.NEWS_API_KEY
                }
            });

            // Format and return only the top 3 most relevant articles
            const articles = response.data.articles.slice(0, 3).map(article => ({
                title: article.title,
                url: article.url,
                source: article.source.name,
                publishedAt: article.publishedAt
            }));

            res.status(200).json({ success: true, data: articles });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to fetch news evidence', details: error.message });
        }
    }

    // @desc    Get stats for pie charts on frontend
    // @route   GET /api/promises/stats/:politicianId
    // @access  Public
    async getStatsByPolitician(req, res) {
        try {
            const stats = await PromiseModel.aggregate([
                { $match: { politicianId: new mongoose.Types.ObjectId(req.params.politicianId) } },
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]);
            
            res.status(200).json({ success: true, data: { politicianId: req.params.politicianId, stats } });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export default new PromiseController();