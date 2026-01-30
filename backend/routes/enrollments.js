const express = require('express');
const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');
const { protect, admin } = require('../middleware/auth.js');
const auditLogMiddleware = require('../middleware/auditMiddleware');

const router = express.Router();

// @route   POST /api/enrollments
// @desc    Enroll in a course
// @access  Private
router.post('/', protect, auditLogMiddleware('Enrollment'), async (req, res) => {
    try {
        const { courseId } = req.body;
        let student = req.user._id;

        // If admin and studentId is provided, use it
        if (req.user.role === 'admin' && req.body.studentId) {
            student = req.body.studentId;
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ student, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        // Create enrollment
        const enrollment = await Enrollment.create({
            student,
            course: courseId,
            semester: course.semester // Auto-inherit semester from course
        });

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Enrollment failed', error: error.message });
    }
});

// @route   GET /api/enrollments/my
// @desc    Get logged in user's enrollments
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course', 'title code credits semester')
            .sort({ enrolledAt: -1 });

        res.json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch enrollments' });
    }
});

// @route   GET /api/enrollments/student/:studentId
// @desc    Get enrollments for a specific student (Admin)
// @access  Private/Admin
router.get('/student/:studentId', protect, admin, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.params.studentId })
            .populate('course', 'title code credits semester')
            .sort({ enrolledAt: -1 });

        res.json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch student enrollments' });
    }
});

// @route   DELETE /api/enrollments/:id
// @desc    Drop a course (Admin or Student themselves)
// @access  Private
router.delete('/:id', protect, auditLogMiddleware('Enrollment'), async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        // Check ownership or admin
        if (enrollment.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to drop this course' });
        }

        await enrollment.deleteOne();

        res.json({ success: true, message: 'Enrollment removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to drop course' });
    }
});

// Helper for GPA calculation
const getGradePoints = (grade) => {
    const weights = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return weights[grade] || 0;
};

// @route   PUT /api/enrollments/:id/grade
// @desc    Update final grade for an enrollment (Admin)
// @access  Private/Admin
router.put('/:id/grade', protect, admin, auditLogMiddleware('Grade'), async (req, res) => {
    try {
        const { grade, status } = req.body;
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({ success: false, message: 'Enrollment not found' });
        }

        enrollment.grade = grade;
        if (status) enrollment.status = status;
        if (status === 'completed' || grade) enrollment.completedAt = Date.now();

        await enrollment.save();
        res.json({ success: true, data: enrollment });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/enrollments/transcript
// @desc    Get transcript/academic records for logged in student
// @access  Private
router.get('/transcript', protect, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.user._id,
            status: 'completed'
        }).populate('course', 'title code credits semester');

        let totalPoints = 0;
        let totalCredits = 0;

        const records = enrollments.map(enr => {
            const points = getGradePoints(enr.grade);
            const credits = enr.course?.credits || 0;
            totalPoints += (points * credits);
            totalCredits += credits;

            return {
                _id: enr._id,
                courseCode: enr.course?.code,
                courseTitle: enr.course?.title,
                semester: enr.semester,
                grade: enr.grade,
                credits,
                points
            };
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        res.json({
            success: true,
            data: {
                student: {
                    name: `${req.user.firstName} ${req.user.lastName}`,
                    studentId: req.user.studentId
                },
                records,
                totalCredits,
                gpa
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to generate transcript' });
    }
});

// @route   GET /api/enrollments/transcript/:studentId
// @desc    Get transcript for any student (Admin)
// @access  Private/Admin
router.get('/transcript/:studentId', protect, admin, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({
            student: req.params.studentId,
            status: 'completed'
        }).populate('course', 'title code credits semester');

        let totalPoints = 0;
        let totalCredits = 0;

        const records = enrollments.map(enr => {
            const points = getGradePoints(enr.grade);
            const credits = enr.course?.credits || 0;
            totalPoints += (points * credits);
            totalCredits += credits;

            return {
                _id: enr._id,
                courseCode: enr.course?.code,
                courseTitle: enr.course?.title,
                semester: enr.semester,
                grade: enr.grade,
                credits,
                points
            };
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        res.json({
            success: true,
            data: {
                records,
                totalCredits,
                gpa
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to generate transcript' });
    }
});

module.exports = router;
