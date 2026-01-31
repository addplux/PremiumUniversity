const EvaluationCriteria = require('../models/EvaluationCriteria');
const EvaluationScore = require('../models/EvaluationScore');
const Bid = require('../models/Bid');

// @desc    Create/Update Criteria for a Tender
// @route   POST /api/evaluation/criteria
// @access  Private (Admin)
exports.setCriteria = async (req, res) => {
    try {
        const criteria = await EvaluationCriteria.create({
            ...req.body,
            organizationId: req.organizationId
        });

        // Optionally update Tender to link this criteria ID
        // await Tender.findByIdAndUpdate(req.body.tenderId, { evaluationCriteriaId: criteria._id });

        res.status(201).json({ success: true, data: criteria });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit Score for a Bid
// @route   POST /api/evaluation/score
// @access  Private (Evaluator)
exports.submitScore = async (req, res) => {
    try {
        const { tenderId, bidId, scores } = req.body;

        // Calculate total score based on weights
        // Simplified Logic: Just sum for now. Real logic needs fetching criteria and applying weights.
        const totalScore = scores.reduce((acc, curr) => acc + curr.score, 0);

        const evaluation = await EvaluationScore.findOneAndUpdate(
            { bidId, evaluatorId: req.user._id },
            {
                tenderId,
                bidId,
                evaluatorId: req.user._id,
                scores,
                totalScore,
                finalized: true,
                finalizedAt: new Date()
            },
            { new: true, upsert: true }
        );

        // Update main Bid with average score if needed (simplified)
        // const allScores = await EvaluationScore.find({ bidId });
        // const avg = ...
        // await Bid.findByIdAndUpdate(bidId, { 'score.total': avg });

        res.json({ success: true, data: evaluation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get Evaluation Results for Tender
// @route   GET /api/evaluation/results/:tenderId
// @access  Private (Admin)
exports.getResults = async (req, res) => {
    try {
        const scores = await EvaluationScore.find({ tenderId: req.params.tenderId })
            .populate('bidId')
            .populate('evaluatorId', 'firstName lastName');

        // Aggregation logic could go here to rank bids

        res.json({ success: true, data: scores });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
