const mongoose = require('mongoose');

const tenderSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    tenderNumber: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Open Tender', 'Restricted Tender', 'RFQ', 'Direct Procurement'],
        required: true,
        default: 'Open Tender'
    },
    category: {
        type: String,
        required: true,
        enum: ['Goods', 'Works', 'Services', 'Consulting']
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    publishDate: {
        type: Date
    },
    closingDate: {
        type: Date,
        required: true
    },
    openingDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Published', 'Closed', 'Under Evaluation', 'Awarded', 'Cancelled'],
        default: 'Draft',
        index: true
    },
    budget: {
        amount: Number,
        currency: { type: String, default: 'USD' }
    },
    participationFee: {
        amount: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' }
    },
    documents: [{
        name: String,
        url: String,
        type: String, // e.g., 'ToR', 'BoQ', 'Draft Contract'
        uploadedAt: { type: Date, default: Date.now }
    }],
    evaluationCriteriaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EvaluationCriteria'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

tenderSchema.index({ organizationId: 1, status: 1 });
tenderSchema.index({ closingDate: 1 });

module.exports = mongoose.model('Tender', tenderSchema);
