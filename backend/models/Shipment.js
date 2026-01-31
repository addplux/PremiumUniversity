const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    trackingNumber: {
        type: String,
        required: true,
        index: true
    },
    carrier: {
        type: String,
        required: true // e.g., 'DHL', 'FedEx', 'UPS', 'Internal Fleet'
    },
    purchaseOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder',
        required: true
    },
    supplierId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    status: {
        type: String,
        enum: ['Label Created', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered', 'Exception', 'Lost'],
        default: 'Label Created'
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    origin: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    destination: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    currentLocation: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        timestamp: Date
    },
    events: [{
        status: String,
        description: String,
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Shipment', shipmentSchema);
