const SupplierContract = require('../models/SupplierContract');

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
exports.getContracts = async (req, res) => {
    try {
        const contracts = await SupplierContract.find({ organizationId: req.organizationId })
            .populate('supplierId', 'name');
        res.json({ success: true, data: contracts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create contract
// @route   POST /api/contracts
// @access  Private
exports.createContract = async (req, res) => {
    try {
        const contract = await SupplierContract.create({
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: contract });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get expiring contracts
// @route   GET /api/contracts/expiring
// @access  Private
exports.getExpiringContracts = async (req, res) => {
    try {
        const days = 30; // Default 30 days
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + days);

        const contracts = await SupplierContract.find({
            organizationId: req.organizationId,
            status: 'Active',
            endDate: {
                $gt: new Date(),
                $lte: expirationDate
            }
        }).populate('supplierId', 'name');

        res.json({ success: true, count: contracts.length, data: contracts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
