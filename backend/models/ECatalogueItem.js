const mongoose = require('mongoose');

const eCatalogueItemSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    contractId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupplierContract'
    },
    name: {
        type: String,
        required: true,
        index: true // Enable text search
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    sku: String,
    unitPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'USD'
    },
    unitOfMeasure: {
        type: String, // e.g., 'Each', 'Box', 'Kg'
        default: 'Each'
    },
    imageUrl: String,
    specifications: {
        type: Map,
        of: String
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    tags: [String]
}, {
    timestamps: true
});

// Text index for searching
eCatalogueItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('ECatalogueItem', eCatalogueItemSchema);
