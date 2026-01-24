const mongoose = require('mongoose');

const equityAuditSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },

    auditType: {
        type: String,
        enum: ['grading', 'admissions', 'financial_aid', 'disciplinary'],
        required: true
    },

    period: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true }
    },

    // Raw Data Aggregates
    metrics: {
        totalAnalyzed: Number,

        // Gender Breakdown
        byGender: {
            male: { type: Map, of: Number }, // e.g., { "A": 50, "B": 30 }
            female: { type: Map, of: Number }
        },

        // Outcome Rates (e.g., Acceptance Rate, Pass Rate)
        outcomeRates: {
            male: Number,
            female: Number,
            overall: Number
        },

        // Additional demographics can be added here
        // e.g., byRegion, byAgeGroup, etc.
    },

    // Analysis Results
    findings: [{
        category: String, // e.g., "Gender Bias in Grading"
        severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical']
        },
        description: String,
        statisticalSignificance: {
            pValue: Number,
            chiSquare: Number,
            isSignificant: Boolean
        },
        recommendation: String
    }],

    status: {
        type: String,
        enum: ['pending_review', 'acknowledged', 'action_taken', 'dismissed'],
        default: 'pending_review'
    },

    notes: String,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for finding recent audits by type
equityAuditSchema.index({ organizationId: 1, auditType: 1, createdAt: -1 });

module.exports = mongoose.model('EquityAudit', equityAuditSchema);
