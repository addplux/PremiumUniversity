const mongoose = require('mongoose');

const supplierContractSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    contractNumber: {
        type: String,
        required: true,
        unique: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Framework Agreement', 'Fixed Price', 'Time and Materials', 'Cost Plus', 'Other'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    terms: {
        type: String,
        required: true
    },
    paymentTerms: {
        type: String,
        enum: ['Net 30', 'Net 60', 'Net 90', 'Advance Payment', 'Milestone Based', 'Other'],
        default: 'Net 30'
    },
    deliveryTerms: String,
    penaltyClause: String,
    renewalOption: {
        type: Boolean,
        default: false
    },
    renewalPeriod: String, // e.g., "1 year", "6 months"
    autoRenewal: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Expired', 'Terminated', 'Renewed'],
        default: 'Draft'
    },
    signedBy: {
        organizationRep: {
            name: String,
            title: String,
            signatureUrl: String,
            signedDate: Date
        },
        supplierRep: {
            name: String,
            title: String,
            signatureUrl: String,
            signedDate: Date
        }
    },
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: Date
    }],
    milestones: [{
        name: String,
        description: String,
        dueDate: Date,
        value: Number,
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed', 'Delayed']
        },
        completedDate: Date
    }],
    amendments: [{
        amendmentNumber: String,
        date: Date,
        description: String,
        documentUrl: String,
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    performanceMetrics: {
        totalPurchaseOrders: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 },
        qualityIssues: { type: Number, default: 0 }
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    terminatedDate: Date,
    terminationReason: String
}, {
    timestamps: true
});

// Indexes
supplierContractSchema.index({ organizationId: 1, contractNumber: 1 }, { unique: true });
supplierContractSchema.index({ organizationId: 1, supplierId: 1 });
supplierContractSchema.index({ organizationId: 1, status: 1 });
supplierContractSchema.index({ endDate: 1 });

// Pre-save middleware to generate contract number
supplierContractSchema.pre('save', async function (next) {
    if (!this.contractNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            organizationId: this.organizationId,
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        this.contractNumber = `SC-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Virtual for contract duration in days
supplierContractSchema.virtual('durationDays').get(function () {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = end - start;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days remaining
supplierContractSchema.virtual('daysRemaining').get(function () {
    const today = new Date();
    const end = new Date(this.endDate);
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for contract utilization percentage
supplierContractSchema.virtual('utilizationPercentage').get(function () {
    if (this.value === 0) return 0;
    return (this.performanceMetrics.totalSpent / this.value) * 100;
});

module.exports = mongoose.model('SupplierContract', supplierContractSchema);
