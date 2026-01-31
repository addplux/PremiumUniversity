const express = require('express');
const router = express.Router();
const {
    createTender,
    publishTender,
    closeTender,
    getPublicTenders,
    getPublicTenderDetails
} = require('../controllers/tenderController');
const { validateTender } = require('../middleware/validation');
const cache = require('../middleware/cache');

const { protect, authorize } = require('../middleware/auth');
const { optionalTenantMiddleware } = require('../middleware/tenantMiddleware');

// Public Routes (Cached for 5 minutes)
router.get('/public', optionalTenantMiddleware, cache(300), getPublicTenders);
router.get('/public/:id', optionalTenantMiddleware, cache(300), getPublicTenderDetails);

// Protected Admin Routes
router.use(protect);
router.use(authorize('admin', 'procurement_manager'));

router.post('/', validateTender, createTender);
router.put('/:id/publish', publishTender);
router.put('/:id/close', closeTender);

module.exports = router;
