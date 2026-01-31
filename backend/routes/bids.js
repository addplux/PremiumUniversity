const express = require('express');
const router = express.Router();
const { submitBid, getTenderBids, updateBidStatus } = require('../controllers/bidController');

const { protect, authorize } = require('../middleware/auth');
const { validateBid } = require('../middleware/validation');

router.use(protect);

// Supplier Route
router.post('/', authorize('supplier', 'admin'), validateBid, submitBid);

// Admin Routes
router.get('/tender/:id', authorize('admin', 'procurement_manager'), getTenderBids);
router.put('/:id/status', authorize('admin', 'procurement_manager'), updateBidStatus);

module.exports = router;
