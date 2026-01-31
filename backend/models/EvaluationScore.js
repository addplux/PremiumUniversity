const mongoose = require('mongoose');

const evaluationScoreSchema = new mongoose.Schema({
    tenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender',
        required: true
    },
    bidId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
        required: true,
        index: true
    },
    evaluatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scores: [{
        criteriaName: String, // De-normalized for easier display
        score: { type: Number, required: true },
        comments: String
    }],
    totalScore: {
        type: Number,
        required: true
    },
    finalized: {
        type: Boolean,
        default: false
    },
    finalizedAt: Date
}, {
    timestamps: true
});

// Ensure one score sheet per evaluator per bid
evaluationScoreSchema.index({ bidId: 1, evaluatorId: 1 }, { unique: true });

module.exports = mongoose.model('EvaluationScore', evaluationScoreSchema);
