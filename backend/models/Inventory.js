const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Receipt', 'Issue', 'Transfer', 'Adjustment', 'Return'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reference: {
        type: String // PO number, transfer number, etc.
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const inventorySchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: true
    },
    locationCode: String, // Specific location within warehouse (e.g., "A-12-3")
    quantity: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    reservedQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    availableQuantity: {
        type: Number,
        default: 0
    },
    unitCost: {
        type: Number,
        required: true,
        min: 0
    },
    totalValue: {
        type: Number,
        default: 0
    },
    reorderLevel: {
        type: Number,
        default: 10
    },
    maxStockLevel: Number,
    batchNumber: String,
    serialNumber: String,
    barcode: String,
    expiryDate: Date,
    manufacturingDate: Date,
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Damaged', 'Expired'],
        default: 'New'
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'In Transit', 'Quarantine', 'Disposed'],
        default: 'Available'
    },
    transactions: [inventoryTransactionSchema],
    lastStockTakeDate: Date,
    lastMovementDate: Date,
    notes: String
}, {
    timestamps: true
});

// Indexes
inventorySchema.index({ organizationId: 1, productId: 1, warehouseId: 1 }, { unique: true });
inventorySchema.index({ organizationId: 1, warehouseId: 1 });
inventorySchema.index({ organizationId: 1, productId: 1 });
inventorySchema.index({ barcode: 1 });
inventorySchema.index({ expiryDate: 1 });

// Pre-save middleware to calculate available quantity and total value
inventorySchema.pre('save', function (next) {
    this.availableQuantity = this.quantity - this.reservedQuantity;
    this.totalValue = this.quantity * this.unitCost;
    next();
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function () {
    if (this.quantity === 0) return 'Out of Stock';
    if (this.quantity <= this.reorderLevel) return 'Low Stock';
    if (this.maxStockLevel && this.quantity >= this.maxStockLevel) return 'Overstock';
    return 'In Stock';
});

// Virtual for days until expiry
inventorySchema.virtual('daysUntilExpiry').get(function () {
    if (!this.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(this.expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Method to add transaction
inventorySchema.methods.addTransaction = function (type, quantity, reference, performedBy, notes) {
    this.transactions.push({
        type,
        quantity,
        reference,
        performedBy,
        notes
    });
    this.lastMovementDate = new Date();
};

module.exports = mongoose.model('Inventory', inventorySchema);
