const Bid = require('../models/Bid');
const Tender = require('../models/Tender');

// @desc    Submit a bid
// @route   POST /api/bids
// @access  Private (Supplier)
exports.submitBid = async (req, res) => {
    try {
        const { tenderId } = req.body;

        // 1. Check if tender exists and is open
        const tender = await Tender.findById(tenderId);
        if (!tender) return res.status(404).json({ message: 'Tender not found' });

        if (tender.status !== 'Published') {
            return res.status(400).json({ message: 'Tender is not open for submission' });
        }

        if (new Date() > new Date(tender.closingDate)) {
            return res.status(400).json({ message: 'Tender submission deadline has passed' });
        }

        // 2. Check if supplier already submitted
        // Assumption: req.user is a Supplier user and has supplierId linked
        // For MVP, we pass supplierId in body or assume robust auth mapping
        const supplierId = req.body.supplierId || req.user.supplierId;

        const existingBid = await Bid.findOne({ tenderId, supplierId });
        if (existingBid) {
            return res.status(400).json({ message: 'You have already submitted a bid for this tender' });
        }

        // 3. Create Bid
        const bid = await Bid.create({
            ...req.body,
            organizationId: tender.organizationId,
            supplierId: supplierId, // Ensure from auth or body
            status: 'Submitted'
        });

        res.status(201).json({ success: true, message: 'Bid submitted successfully', data: bid });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get bids for a tender
// @route   GET /api/tenders/:id/bids
// @access  Private (Admin - Only after Opening Date)
exports.getTenderBids = async (req, res) => {
    try {
        const tender = await Tender.findById(req.params.id);
        if (!tender) return res.status(404).json({ message: 'Tender not found' });

        // Security Check: Cannot view bids before opening date
        // if (new Date() < new Date(tender.openingDate)) {
        //     return res.status(403).json({ message: 'Bids are sealed until the Opening Date' });
        // }

        const bids = await Bid.find({ tenderId: req.params.id })
            .populate('supplierId', 'name email contactPerson');

        res.json({ success: true, count: bids.length, data: bids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update bid status (Shortlist/Disqualify)
// @route   PUT /api/bids/:id/status
// @access  Private (Admin)
exports.updateBidStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const bid = await Bid.findById(req.params.id);
        if (!bid) return res.status(404).json({ message: 'Bid not found' });

        bid.status = status;
        if (notes) bid.notes = notes;
        await bid.save();

        res.json({ success: true, data: bid });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
