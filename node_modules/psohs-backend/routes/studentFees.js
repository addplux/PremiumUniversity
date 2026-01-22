const express = require('express');
const StudentFee = require('../models/StudentFee.js');
const User = require('../models/User.js');
const { protect, systemAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/student-fees
// @desc    Get all student fee records
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { rollNo, semester, status, academicYear } = req.query;
        const query = {};

        if (rollNo) query.rollNo = rollNo;
        if (semester) query.semester = semester;
        if (status) query.status = status;
        if (academicYear) query.academicYear = academicYear;

        const fees = await StudentFee.find(query)
            .populate('student', 'firstName lastName email')
            .populate('submittedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: fees.length,
            data: fees
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fee records'
        });
    }
});

// @route   GET /api/student-fees/student/:rollNo
// @desc    Get fee records by student roll number
// @access  Private
router.get('/student/:rollNo', protect, async (req, res) => {
    try {
        const fees = await StudentFee.find({ rollNo: req.params.rollNo })
            .populate('student', 'firstName lastName email')
            .sort({ semester: 1, createdAt: -1 });

        // Calculate total outstanding
        const totalOutstanding = fees.reduce((sum, fee) => sum + fee.remainingBalance, 0);

        res.json({
            success: true,
            data: {
                fees,
                totalOutstanding,
                paymentHistory: fees.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student fee records'
        });
    }
});

// @route   POST /api/student-fees
// @desc    Submit student fee payment
// @access  Private/Admin
router.post('/', protect, systemAdmin, async (req, res) => {
    try {
        const {
            rollNo,
            studentName,
            parentName,
            course,
            branch,
            semester,
            academicYear,
            totalSemesterFee,
            previousSemesterDue,
            amountPaid,
            paymentMethod,
            transactionId,
            remarks
        } = req.body;

        // Find student by roll number
        const student = await User.findOne({ rollNo, role: 'student' });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found with this roll number'
            });
        }

        const studentFee = await StudentFee.create({
            student: student._id,
            rollNo,
            studentName: studentName || `${student.firstName} ${student.lastName}`,
            parentName,
            course,
            branch,
            semester,
            academicYear,
            totalSemesterFee,
            previousSemesterDue: previousSemesterDue || 0,
            amountPaid,
            paymentMethod,
            transactionId,
            remarks,
            submittedBy: req.user._id
        });

        const populatedFee = await StudentFee.findById(studentFee._id)
            .populate('student', 'firstName lastName email rollNo')
            .populate('submittedBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            message: 'Fee payment recorded successfully',
            data: populatedFee
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to record fee payment';
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(val => val.message).join(', ');
        }
        res.status(400).json({
            success: false,
            message,
            error: error.message
        });
    }
});

// @route   PUT /api/student-fees/:id
// @desc    Update student fee record
// @access  Private/Admin
router.put('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const {
            totalSemesterFee,
            previousSemesterDue,
            amountPaid,
            paymentMethod,
            transactionId,
            remarks
        } = req.body;

        const studentFee = await StudentFee.findById(req.params.id);
        if (!studentFee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        if (totalSemesterFee !== undefined) studentFee.totalSemesterFee = totalSemesterFee;
        if (previousSemesterDue !== undefined) studentFee.previousSemesterDue = previousSemesterDue;
        if (amountPaid !== undefined) studentFee.amountPaid = amountPaid;
        if (paymentMethod) studentFee.paymentMethod = paymentMethod;
        if (transactionId) studentFee.transactionId = transactionId;
        if (remarks) studentFee.remarks = remarks;

        await studentFee.save();

        const populatedFee = await StudentFee.findById(studentFee._id)
            .populate('student', 'firstName lastName email rollNo')
            .populate('submittedBy', 'firstName lastName');

        res.json({
            success: true,
            message: 'Fee record updated successfully',
            data: populatedFee
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update fee record',
            error: error.message
        });
    }
});

// @route   DELETE /api/student-fees/:id
// @desc    Delete fee record
// @access  Private/Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const studentFee = await StudentFee.findById(req.params.id);

        if (!studentFee) {
            return res.status(404).json({
                success: false,
                message: 'Fee record not found'
            });
        }

        await studentFee.deleteOne();

        res.json({
            success: true,
            message: 'Fee record removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete fee record'
        });
    }
});

module.exports = router;
