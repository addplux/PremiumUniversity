const express = require('express');
const Examination = require('../models/Examination.js');
const User = require('../models/User.js');
const { protect, systemAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/examinations
// @desc    Get all examinations
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const { student, semester, academicYear } = req.query;
        const query = {};

        if (student) query.student = student;
        if (semester) query.semester = semester;
        if (academicYear) query.academicYear = academicYear;

        const examinations = await Examination.find(query)
            .populate('student', 'firstName lastName rollNo email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: examinations.length,
            data: examinations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch examinations'
        });
    }
});

// @route   GET /api/examinations/student/:rollNo
// @desc    Get examinations by student roll number
// @access  Private
router.get('/student/:rollNo', protect, async (req, res) => {
    try {
        const student = await User.findOne({ rollNo: req.params.rollNo, role: 'student' });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const examinations = await Examination.find({ student: student._id })
            .populate('student', 'firstName lastName rollNo email')
            .sort({ semester: -1 });

        res.json({
            success: true,
            data: examinations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch student examinations'
        });
    }
});

// @route   POST /api/examinations
// @desc    Create examination record
// @access  Private/Admin
router.post('/', protect, systemAdmin, async (req, res) => {
    try {
        const { rollNo, semester, academicYear, courses } = req.body;

        // Find student by roll number
        const student = await User.findOne({ rollNo, role: 'student' });
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found with this roll number'
            });
        }

        // Check if examination record already exists
        const existingExam = await Examination.findOne({
            student: student._id,
            semester,
            academicYear
        });

        if (existingExam) {
            return res.status(400).json({
                success: false,
                message: 'Examination record already exists for this semester'
            });
        }

        const examination = await Examination.create({
            student: student._id,
            semester,
            academicYear,
            courses
        });

        const populatedExam = await Examination.findById(examination._id)
            .populate('student', 'firstName lastName rollNo email');

        res.status(201).json({
            success: true,
            message: 'Examination record created successfully',
            data: populatedExam
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to create examination record';
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

// @route   PUT /api/examinations/:id
// @desc    Update examination record
// @access  Private/Admin
router.put('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const { semester, academicYear, courses } = req.body;

        const examination = await Examination.findById(req.params.id);
        if (!examination) {
            return res.status(404).json({
                success: false,
                message: 'Examination record not found'
            });
        }

        if (semester) examination.semester = semester;
        if (academicYear) examination.academicYear = academicYear;
        if (courses) examination.courses = courses;

        await examination.save();

        const populatedExam = await Examination.findById(examination._id)
            .populate('student', 'firstName lastName rollNo email');

        res.json({
            success: true,
            message: 'Examination record updated successfully',
            data: populatedExam
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update examination record',
            error: error.message
        });
    }
});

// @route   DELETE /api/examinations/:id
// @desc    Delete examination record
// @access  Private/Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const examination = await Examination.findById(req.params.id);

        if (!examination) {
            return res.status(404).json({
                success: false,
                message: 'Examination record not found'
            });
        }

        await examination.deleteOne();

        res.json({
            success: true,
            message: 'Examination record removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete examination record'
        });
    }
});

module.exports = router;
