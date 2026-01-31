const Tender = require('../models/Tender');
const EvaluationCriteria = require('../models/EvaluationCriteria');

// @desc    Get all public tenders
// @route   GET /api/public/tenders
// @access  Public
exports.getPublicTenders = async (req, res) => {
    try {
        const tenders = await Tender.find({
            status: { $in: ['Published', 'Awarded'] },
            publishDate: { $lte: new Date() }
        })
            .select('-documents -participationFee') // Hide sensitive details for list view
            .sort({ closingDate: 1 });

        res.json({ success: true, count: tenders.length, data: tenders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get tender details (Public)
// @route   GET /api/public/tenders/:id
// @access  Public
exports.getPublicTenderDetails = async (req, res) => {
    try {
        const tender = await Tender.findOne({
            _id: req.params.id,
            status: { $in: ['Published', 'Awarded'] }
        });

        if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });

        res.json({ success: true, data: tender });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new tender
// @route   POST /api/tenders
// @access  Private (Admin/Procurement)
exports.createTender = async (req, res) => {
    try {
        const tender = await Tender.create({
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: tender });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Publish tender
// @route   PUT /api/tenders/:id/publish
// @access  Private (Admin)
exports.publishTender = async (req, res) => {
    try {
        const tender = await Tender.findOne({ _id: req.params.id, organizationId: req.organizationId });

        if (!tender) return res.status(404).json({ message: 'Tender not found' });

        tender.status = 'Published';
        tender.publishDate = new Date();
        await tender.save();

        res.json({ success: true, data: tender, message: 'Tender published successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Close tender manually
// @route   PUT /api/tenders/:id/close
// @access  Private (Admin)
exports.closeTender = async (req, res) => {
    try {
        const tender = await Tender.findOne({ _id: req.params.id, organizationId: req.organizationId });
        if (!tender) return res.status(404).json({ message: 'Tender not found' });

        tender.status = 'Closed';
        await tender.save();
        res.json({ success: true, data: tender });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
