const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    tenderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tender',
        required: true,
        index: true
    },
    organizationId: { // The procuring entity
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true,
        index: true
    },
    submissionDate: {
        type: Date,
        default: Date.now
    },
    technicalProposalUrl: {
        type: String,
        required: true
    },
    financialProposalUrl: {
        type: String,
        required: true
    },
    bidSecurity: {
        required: { type: Boolean, default: false },
        amount: Number,
        currency: String,
        documentUrl: String,
        expiryDate: Date
    },
    totalAmount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    validityPeriod: {
        type: Number, // Days
        default: 90
    },
    status: {
        type: String,
        enum: ['Submitted', 'Withdrawn', 'Under Evaluation', 'Shortlisted', 'Disqualified', 'Awarded', 'Rejected'],
        default: 'Submitted'
    },
    score: {
        technical: { type: Number, default: 0 },
        financial: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    notes: String
}, {
    timestamps: true
});

// Ensure one bid per supplier per tender
bidSchema.index({ tenderId: 1, supplierId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
