const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Please add warehouse name'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add warehouse code'],
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Main', 'Branch', 'Transit', 'Cold Storage', 'Other'],
        default: 'Main'
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    capacity: {
        total: { type: Number, required: true }, // in cubic meters or square meters
        unit: { type: String, enum: ['sqm', 'cbm'], default: 'sqm' },
        used: { type: Number, default: 0 }
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    staff: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['Manager', 'Supervisor', 'Clerk', 'Handler', 'Security']
        }
    }],
    locations: [{
        code: String,
        name: String,
        type: { type: String, enum: ['Aisle', 'Rack', 'Shelf', 'Bin', 'Zone'] },
        capacity: Number,
        occupied: { type: Number, default: 0 }
    }],
    operatingHours: {
        monday: { open: String, close: String },
        tuesday: { open: String, close: String },
        wednesday: { open: String, close: String },
        thursday: { open: String, close: String },
        friday: { open: String, close: String },
        saturday: { open: String, close: String },
        sunday: { open: String, close: String }
    },
    facilities: {
        coldStorage: { type: Boolean, default: false },
        securitySystem: { type: Boolean, default: false },
        fireProtection: { type: Boolean, default: false },
        loadingDock: { type: Boolean, default: false },
        forklifts: { type: Number, default: 0 }
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Maintenance', 'Full'],
        default: 'Active'
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
warehouseSchema.index({ organizationId: 1, code: 1 }, { unique: true });
warehouseSchema.index({ organizationId: 1, status: 1 });
warehouseSchema.index({ organizationId: 1, managerId: 1 });

// Virtual for capacity utilization percentage
warehouseSchema.virtual('capacityUtilization').get(function () {
    if (this.capacity.total === 0) return 0;
    return (this.capacity.used / this.capacity.total) * 100;
});

module.exports = mongoose.model('Warehouse', warehouseSchema);
