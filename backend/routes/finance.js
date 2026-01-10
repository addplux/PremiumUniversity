import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { protect, financeAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/finance
// @desc    Get all payments
// @access  Private/Admin
router.get('/', protect, financeAdmin, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('student', 'firstName lastName email studentId')
            .populate('recordedBy', 'firstName lastName')
            .sort({ date: -1 });

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
// @desc    Record a new payment
// @access  Private/Admin
router.post('/', protect, financeAdmin, async (req, res) => {
    try {
        const { studentId, amount, paymentMethod, reference, description, status } = req.body;

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const payment = await Payment.create({
            student: studentId,
            amount,
            paymentMethod,
            reference,
            description,
            status: status || 'completed',
            recordedBy: req.user._id
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
        const payments = await Payment.find({ student: req.user._id }).sort({ date: -1 });

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
        const payments = await Payment.find({ student: req.params.id }).sort({ date: -1 });

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
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
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

export default router;
