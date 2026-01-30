const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');
const recommendationService = require('../services/recommendationService');

router.use(tenantMiddleware);
router.use(protect);

// @route   GET /api/ai/recommendations
// @desc    Get personalized recommendations
router.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await recommendationService.getRecommendations(
            req.user.id,
            req.organizationId
        );
        res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Recommendation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/ai/track
// @desc    Track learning interaction
router.post('/track', async (req, res) => {
    try {
        const interaction = await recommendationService.trackInteraction({
            ...req.body,
            studentId: req.user.id,
            organizationId: req.organizationId
        });
        res.status(201).json({ success: true, data: interaction });
    } catch (error) {
        console.error('Tracking error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
