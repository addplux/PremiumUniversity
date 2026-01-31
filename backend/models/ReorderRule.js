const mongoose = require('mongoose');

const reorderRuleSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true,
        index: true
    },
    minStockLevel: {
        type: Number,
        required: true,
        min: 0
    },
    maxStockLevel: {
        type: Number,
        required: true,
        min: 0
    },
    reorderQuantity: {
        type: Number, // Fixed quantity to reorder or calculate dynamically if 0 
        default: 0
    },
    preferredSupplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    autoApprove: {
        type: Boolean,
        default: false,
        description: 'If true, automatically creates an Approved Requisition or PO'
    },
    approvalWorkflowId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ApprovalWorkflow'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastTriggeredAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Ensure only one active rule per product per warehouse
reorderRuleSchema.index({ organizationId: 1, productId: 1, warehouseId: 1, isActive: 1 }, { unique: true });

module.exports = mongoose.model('ReorderRule', reorderRuleSchema);
