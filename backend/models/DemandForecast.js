const mongoose = require('mongoose');

const demandForecastSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
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
    forecastDate: {
        type: Date,
        required: true
    },
    period: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly'],
        default: 'Monthly'
    },
    predictedQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    algorithmUsed: {
        type: String, // e.g., 'Moving Average', 'Linear Regression', 'ARIMA'
        default: 'Moving Average'
    },
    actualQuantity: {
        type: Number, // Populated later to measure accuracy
        default: null
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
});

demandForecastSchema.index({ organizationId: 1, productId: 1, warehouseId: 1, forecastDate: 1 }, { unique: true });

module.exports = mongoose.model('DemandForecast', demandForecastSchema);
