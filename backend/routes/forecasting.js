const express = require('express');
const router = express.Router();
const { generateForecast, getProductForecast, getForecastingDashboard } = require('../controllers/forecastingController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'procurement_manager'));

router.get('/generate', generateForecast);
router.get('/dashboard', getForecastingDashboard);
router.get('/product/:id', getProductForecast);

module.exports = router;
