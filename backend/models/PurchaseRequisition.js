const mongoose = require('mongoose');

const requisitionItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        required: true
    },
    estimatedUnitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    estimatedTotal: {
        type: Number,
        required: true
    },
    specifications: String,
    notes: String
});

const purchaseRequisitionSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    requisitionNumber: {
        type: String,
        required: true,
        unique: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    departmentName: {
        type: String,
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    requiredBy: {
        type: Date,
        required: true
    },
    items: [requisitionItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    purpose: {
        type: String,
        required: true
    },
    budgetCode: String,
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Converted'],
        default: 'Draft'
    },
    approvalHistory: [{
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
            enum: ['Approved', 'Rejected', 'Returned']
        },
        level: Number,
        comments: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    currentApprovalLevel: {
        type: Number,
        default: 0
    },
    purchaseOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    rejectionReason: String,
    notes: String,
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }]
}, {
    timestamps: true
});

// Indexes
purchaseRequisitionSchema.index({ organizationId: 1, requisitionNumber: 1 }, { unique: true });
purchaseRequisitionSchema.index({ organizationId: 1, status: 1 });
purchaseRequisitionSchema.index({ organizationId: 1, requestedBy: 1 });
purchaseRequisitionSchema.index({ organizationId: 1, departmentId: 1 });
purchaseRequisitionSchema.index({ requestDate: -1 });

// Pre-save middleware to generate requisition number
purchaseRequisitionSchema.pre('save', async function (next) {
    if (!this.requisitionNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            organizationId: this.organizationId,
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        this.requisitionNumber = `PR-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Pre-save middleware to calculate total amount
purchaseRequisitionSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.estimatedTotal, 0);
    next();
});

module.exports = mongoose.model('PurchaseRequisition', purchaseRequisitionSchema);
