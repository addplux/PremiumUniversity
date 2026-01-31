const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please add product name'],
        trim: true
    },
    sku: {
        type: String,
        required: [true, 'Please add SKU'],
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add description']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Office Supplies',
            'IT Equipment',
            'Furniture',
            'Laboratory Equipment',
            'Medical Supplies',
            'Cleaning Supplies',
            'Books & Publications',
            'Food & Beverages',
            'Maintenance Supplies',
            'Other'
        ]
    },
    subcategory: String,
    unit: {
        type: String,
        required: true,
        enum: ['Piece', 'Box', 'Carton', 'Kg', 'Liter', 'Meter', 'Set', 'Pack', 'Dozen', 'Other']
    },
    specifications: {
        brand: String,
        model: String,
        color: String,
        size: String,
        weight: String,
        dimensions: String,
        material: String,
        other: mongoose.Schema.Types.Mixed
    },
    images: [{
        url: String,
        caption: String
    }],
    reorderLevel: {
        type: Number,
        default: 10
    },
    standardPrice: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    preferredSuppliers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    active: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
productSchema.index({ organizationId: 1, sku: 1 }, { unique: true });
productSchema.index({ organizationId: 1, category: 1 });
productSchema.index({ organizationId: 1, active: 1 });
productSchema.index({ organizationId: 1, name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
