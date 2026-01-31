const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please add supplier name'],
        trim: true
    },
    registrationNumber: {
        type: String,
        required: [true, 'Please add registration number'],
        trim: true
    },
    taxId: {
        type: String,
        required: [true, 'Please add tax ID'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add email'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Please add phone number']
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    category: {
        type: String,
        enum: ['Goods', 'Services', 'Works', 'Consultancy', 'Other'],
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended', 'Blacklisted'],
        default: 'Active'
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
        swiftCode: String,
        branchCode: String
    },
    contactPerson: {
        name: String,
        email: String,
        phone: String,
        position: String
    },
    certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        documentUrl: String
    }],
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: Date
    }],
    performanceMetrics: {
        totalOrders: { type: Number, default: 0 },
        completedOrders: { type: Number, default: 0 },
        onTimeDeliveries: { type: Number, default: 0 },
        qualityRejections: { type: Number, default: 0 },
        averageDeliveryTime: { type: Number, default: 0 } // in days
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
supplierSchema.index({ organizationId: 1, registrationNumber: 1 }, { unique: true });
supplierSchema.index({ organizationId: 1, email: 1 });
supplierSchema.index({ organizationId: 1, status: 1 });
supplierSchema.index({ organizationId: 1, category: 1 });

// Virtual for on-time delivery rate
supplierSchema.virtual('onTimeDeliveryRate').get(function () {
    if (this.performanceMetrics.completedOrders === 0) return 0;
    return (this.performanceMetrics.onTimeDeliveries / this.performanceMetrics.completedOrders) * 100;
});

// Virtual for completion rate
supplierSchema.virtual('completionRate').get(function () {
    if (this.performanceMetrics.totalOrders === 0) return 0;
    return (this.performanceMetrics.completedOrders / this.performanceMetrics.totalOrders) * 100;
});

module.exports = mongoose.model('Supplier', supplierSchema);
