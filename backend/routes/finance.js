const express = require('express');
const Payment = require('../models/Payment.js');
const User = require('../models/User.js');
const { protect, financeAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/finance
// @desc    Get all payments for the organization
// @access  Private/Admin
router.get('/', protect, financeAdmin, async (req, res) => {
    try {
        const payments = await Payment.find({ organizationId: req.organizationId })
            .populate('studentId', 'firstName lastName email studentId')
            .populate('recordedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
});

// @route   POST /api/finance
// @desc    Record a new payment manually (cash/bank/etc)
// @access  Private/Admin
router.post('/', protect, financeAdmin, async (req, res) => {
    try {
        const { studentId, amount, paymentMethod, reference, description, status, currency } = req.body;

        const student = await User.findOne({ _id: studentId, organizationId: req.organizationId });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const payment = await Payment.create({
            organizationId: req.organizationId,
            studentId,
            amount,
            currency: currency || 'ZMW',
            paymentMethod,
            mobileMoneyDetails: {
                reference,
                provider: paymentMethod
            },
            description,
            status: status || 'completed',
            recordedBy: req.user._id,
            paidAt: status === 'completed' ? new Date() : null
        });

        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Reference number already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/finance/my
// @desc    Get current student's payments
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const payments = await Payment.find({
            studentId: req.user._id,
            organizationId: req.organizationId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch your payments' });
    }
});

// @route   GET /api/finance/student/:id
// @desc    Get specific student's payments
// @access  Private/Admin
router.get('/student/:id', protect, financeAdmin, async (req, res) => {
    try {
        const payments = await Payment.find({
            studentId: req.params.id,
            organizationId: req.organizationId
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch student payments' });
    }
});

// @route   GET /api/finance/stats
// @desc    Get financial statistics
// @access  Private/Admin
router.get('/stats', protect, financeAdmin, async (req, res) => {
    try {
        const stats = await Payment.aggregate([
            { $match: { organizationId: req.organizationId } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            { $match: { organizationId: req.organizationId } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$amount' }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalRevenue: stats[0]?.totalRevenue || 0,
                totalPayments: stats[0]?.count || 0,
                monthlyRevenue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

module.exports = router;
