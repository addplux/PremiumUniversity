const express = require('express');
const router = express.Router();
const { createReorderRule, getReorderRules, triggerReorderCheck } = require('../controllers/automationController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'procurement_manager'));

router.route('/reorder-rules')
    .post(createReorderRule)
    .get(getReorderRules);

router.post('/trigger', triggerReorderCheck);

module.exports = router;
