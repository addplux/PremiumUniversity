const mongoose = require('mongoose');

const evaluationCriteriaSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    tenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender',
        required: true,
        index: true
    },
    name: {
        type: String, // e.g., "Standard Technical Evaluation"
        required: true
    },
    sections: [{
        name: { type: String, required: true }, // e.g., "Technical", "Financial"
        weight: { type: Number, required: true }, // e.g., 70, 30
        criteria: [{
            name: { type: String, required: true },
            description: String,
            maxScore: { type: Number, required: true },
            type: {
                type: String,
                enum: ['Pass/Fail', 'Score', 'Automated'],
                default: 'Score'
            },
            minScoreRequired: { type: Number, default: 0 }
        }]
    }],
    passingScore: {
        type: Number,
        default: 70
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('EvaluationCriteria', evaluationCriteriaSchema);
