const express = require('express');
const router = express.Router();
const { createShipment, trackShipment, updateShipmentStatus } = require('../controllers/logisticsController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'procurement_manager', 'warehouse_staff'));

router.post('/shipment', createShipment);
router.put('/shipment/:id/update', updateShipmentStatus);
router.get('/track/:trackingNumber', trackShipment);

module.exports = router;
