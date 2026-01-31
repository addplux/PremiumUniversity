const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
    unitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    receivedQuantity: {
        type: Number,
        default: 0
    },
    specifications: String,
    notes: String
});

const purchaseOrderSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    poNumber: {
        type: String,
        required: true,
        unique: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    requisitionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseRequisition'
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    departmentName: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date,
        required: true
    },
    actualDeliveryDate: Date,
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    tax: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: [
            'Draft',
            'Pending Approval',
            'Approved',
            'Sent',
            'Confirmed',
            'In Transit',
            'Partially Delivered',
            'Delivered',
            'Invoiced',
            'Paid',
            'Completed',
            'Cancelled',
            'Rejected'
        ],
        default: 'Draft'
    },
    deliveryAddress: {
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        },
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        contactPerson: String,
        contactPhone: String
    },
    paymentTerms: {
        type: String,
        enum: ['Net 30', 'Net 60', 'Net 90', 'Advance Payment', 'Cash on Delivery', 'Other'],
        default: 'Net 30'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Partial', 'Paid'],
        default: 'Pending'
    },
    deliveries: [{
        deliveryDate: Date,
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        items: [{
            itemId: mongoose.Schema.Types.ObjectId,
            quantity: Number,
            condition: String
        }],
        notes: String,
        documents: [{
            name: String,
            url: String
        }]
    }],
    invoices: [{
        invoiceNumber: String,
        invoiceDate: Date,
        amount: Number,
        dueDate: Date,
        paidDate: Date,
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Overdue']
        },
        documentUrl: String
    }],
    terms: String,
    notes: String,
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }],
    sentToSupplierAt: Date,
    confirmedBySupplierAt: Date,
    cancelledAt: Date,
    cancellationReason: String
}, {
    timestamps: true
});

// Indexes
purchaseOrderSchema.index({ organizationId: 1, poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ organizationId: 1, status: 1 });
purchaseOrderSchema.index({ organizationId: 1, supplierId: 1 });
purchaseOrderSchema.index({ organizationId: 1, departmentId: 1 });
purchaseOrderSchema.index({ orderDate: -1 });
purchaseOrderSchema.index({ expectedDeliveryDate: 1 });

// Pre-save middleware to generate PO number
purchaseOrderSchema.pre('save', async function (next) {
    if (!this.poNumber) {
        const year = new Date().getFullYear();
        const count = await this.constructor.countDocuments({
            organizationId: this.organizationId,
            createdAt: {
                $gte: new Date(year, 0, 1),
                $lt: new Date(year + 1, 0, 1)
            }
        });
        this.poNumber = `PO-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    next();
});

// Pre-save middleware to calculate totals
purchaseOrderSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.grandTotal = this.totalAmount + this.tax + this.shippingCost;
    next();
});

// Virtual for delivery status
purchaseOrderSchema.virtual('deliveryStatus').get(function () {
    const totalOrdered = this.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalReceived = this.items.reduce((sum, item) => sum + item.receivedQuantity, 0);

    if (totalReceived === 0) return 'Not Delivered';
    if (totalReceived < totalOrdered) return 'Partially Delivered';
    return 'Fully Delivered';
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
