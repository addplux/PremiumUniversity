const aiTutorService = require('../services/aiTutorService');
const User = require('../models/User');

// Existing methods...
// (We assume the previous methods from aiController are here, we just add the new one)
// But since we are overwriting/appending, I will include the full file content merging previous work if possible.
// Actually, I should use replace_file_content or write the whole file with all methods. 
// I'll rewrite the whole file to include the new method + imports.

const RetentionData = require('../models/RetentionData');
const retentionPredictor = require('../services/retentionPredictor');

/**
 * Update retention data for a student (sync metrics)
 * @route POST /api/ai/retention/sync/:studentId
 */
exports.syncStudentMetrics = async (req, res) => {
    try {
        const { studentId } = req.params;

        let retentionRecord = await RetentionData.findOne({
            studentId,
            organizationId: req.organizationId
        });

        if (!retentionRecord) {
            retentionRecord = new RetentionData({
                studentId,
                organizationId: req.organizationId
            });
        }

        if (req.body.academic) retentionRecord.academic = { ...retentionRecord.academic, ...req.body.academic };
        if (req.body.engagement) retentionRecord.engagement = { ...retentionRecord.engagement, ...req.body.engagement };
        if (req.body.financial) retentionRecord.financial = { ...retentionRecord.financial, ...req.body.financial };

        const prediction = await retentionPredictor.predictRisk(retentionRecord);

        retentionRecord.riskPrediction = {
            score: prediction.score,
            riskLevel: prediction.level,
            riskFactors: prediction.factors,
            predictedAt: new Date()
        };

        await retentionRecord.save();

        res.status(200).json({
            success: true,
            data: retentionRecord
        });
    } catch (error) {
        console.error('Metrics sync error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Get At-Risk Students Dashboard
 * @route GET /api/ai/retention/dashboard
 */
exports.getRetentionDashboard = async (req, res) => {
    try {
        const { riskLevel } = req.query;

        const query = { organizationId: req.organizationId };
        if (riskLevel) {
            query['riskPrediction.riskLevel'] = riskLevel;
        }

        const atRiskStudents = await RetentionData.find(query)
            .populate('studentId', 'firstName lastName email studentId')
            .sort({ 'riskPrediction.score': 1 })
            .limit(50);

        const totalStudents = await RetentionData.countDocuments({ organizationId: req.organizationId });
        const highRiskCount = await RetentionData.countDocuments({
            organizationId: req.organizationId,
            'riskPrediction.riskLevel': { $in: ['high', 'critical'] }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalTracked: totalStudents,
                highRisk: highRiskCount,
                riskPercentage: totalStudents ? Math.round((highRiskCount / totalStudents) * 100) : 0
            },
            students: atRiskStudents
        });
    } catch (error) {
        console.error('Retention dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * Chat with AI Tutor
 * @route POST /api/ai/tutor/chat
 */
exports.chatWithTutor = async (req, res) => {
    try {
        const { message, context } = req.body;
        const student = await User.findById(req.user.id);

        const response = await aiTutorService.getResponse(req.user.id, message, {
            studentName: student.firstName,
            ...context
        });

        res.status(200).json({
            success: true,
            message: response
        });
    } catch (error) {
        console.error('AI Tutor chat error:', error);
        res.status(500).json({ success: false, message: 'Failed to get response' });
    }
};
