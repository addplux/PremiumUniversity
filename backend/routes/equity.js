const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const equityAuditService = require('../services/equityAuditService');
const EquityAudit = require('../models/EquityAudit');

router.use(tenantMiddleware);
router.use(protect);
router.use(admin);

// @route   POST /api/ai/equity/run
// @desc    Trigger a new equity audit
router.post('/run', async (req, res) => {
    try {
        const { type, startDate, endDate } = req.body;

        const period = {
            startDate: new Date(startDate || new Date().setMonth(new Date().getMonth() - 6)),
            endDate: new Date(endDate || Date.now())
        };

        if (type === 'grading') {
            const audit = await equityAuditService.runGradingAudit(req.organizationId, period);
            return res.status(200).json({ success: true, data: audit });
        }

        // Other types can be implemented similarly

        res.status(400).json({ success: false, message: 'Invalid audit type' });
    } catch (error) {
        console.error('Equity audit error:', error);
        res.status(500).json({ success: false, message: 'Failed to run audit' });
    }
});

// @route   GET /api/ai/equity/history
// @desc    Get past audits
router.get('/history', async (req, res) => {
    try {
        const audits = await EquityAudit.find({ organizationId: req.organizationId })
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ success: true, data: audits });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
