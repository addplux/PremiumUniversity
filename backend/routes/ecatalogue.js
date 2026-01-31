const express = require('express');
const router = express.Router();
const { getCatalogueItems, checkoutParams } = require('../controllers/ecatalogueController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCatalogueItems);
router.post('/checkout', checkoutParams);

// Admin Item Management (Optional for now)
// router.post('/', authorize('admin'), createItem);

module.exports = router;
