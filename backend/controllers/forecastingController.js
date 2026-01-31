const DemandForecast = require('../models/DemandForecast');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');

// @desc    Generate forecast for a product
// @route   GET /api/forecasting/generate
// @access  Private
exports.generateForecast = async (req, res) => {
    try {
        const { productId, warehouseId, period = 'Monthly' } = req.query;
        const organizationId = req.organizationId;

        // In a real implementation, this would call a Python service or use TensorFlow.js
        // For MVP, we'll implement a Simple Moving Average (SMA) based on mock mock sales/usage data
        // or just random generation for demonstration if no history exists.

        // Mock logic: Get last 3 months usage (random for now to simulate)
        const months = [100, 120, 110]; // Mock data
        const avg = months.reduce((a, b) => a + b, 0) / months.length;
        const predictedQty = Math.round(avg * 1.05); // Assume 5% growth

        const forecast = await DemandForecast.create({
            organizationId,
            productId,
            warehouseId,
            forecastDate: new Date(),
            period,
            predictedQuantity: predictedQty,
            confidenceScore: 85,
            algorithmUsed: 'Simple Moving Average (Mock)',
            metadata: {
                reason: 'Based on 3-month mock average'
            }
        });

        res.json({
            success: true,
            message: 'Forecast generated successfully',
            data: forecast
        });
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating forecast',
            error: error.message
        });
    }
};

// @desc    Get forecast for a product
// @route   GET /api/forecasting/product/:id
// @access  Private
exports.getProductForecast = async (req, res) => {
    try {
        const forecasts = await DemandForecast.find({
            organizationId: req.organizationId,
            productId: req.params.id
        }).sort({ forecastDate: -1 }).limit(10);

        res.json({
            success: true,
            data: forecasts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching forecasts',
            error: error.message
        });
    }
};

// @desc    Get dashboard metrics
// @route   GET /api/forecasting/dashboard
// @access  Private
exports.getForecastingDashboard = async (req, res) => {
    try {
        const organizationId = req.organizationId;

        // Mock dashboard data
        const data = {
            totalForecasts: await DemandForecast.countDocuments({ organizationId }),
            accuracy: 88.5,
            topPredictedProducts: [
                { name: 'Paper A4', predicted: 5000, trend: '+10%' },
                { name: 'Printer Toner', predicted: 200, trend: '+5%' }
            ]
        };

        res.json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data',
            error: error.message
        });
    }
};
