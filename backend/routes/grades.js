import express from 'express';
import Grade from '../models/Grade.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { protect, academicAdmin } from '../middleware/auth.js';
import { auditMiddleware } from '../utils/auditLogger.js';

const router = express.Router();

// @route   POST /api/grades
// @desc    Post CA/GPA for a student (Academic Admin only)
// @access  Private/Academic Admin
router.post('/', protect, academicAdmin, auditMiddleware('grade_posted', 'Grade'), async (req, res) => {
    try {
        const { studentId, courseId, caMarks, examMarks, semester, academicYear, remarks } = req.body;

        // Verify student exists
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if student is enrolled in the course
        const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (!enrollment) {
            return res.status(400).json({ success: false, message: 'Student is not enrolled in this course' });
        }

        const grade = await Grade.create({
            student: studentId,
            course: courseId,
            caMarks,
            examMarks,
            semester,
            academicYear,
            remarks,
            postedBy: req.user._id
        });

        const populatedGrade = await Grade.findById(grade._id)
            .populate('student', 'firstName lastName email')
            .populate('course', 'title code');

        res.status(201).json({
            success: true,
            data: populatedGrade
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Grade already exists for this student in this course for the specified semester' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/grades/:id
// @desc    Update grade (Academic Admin only)
// @access  Private/Academic Admin
router.put('/:id', protect, academicAdmin, auditMiddleware('grade_updated', 'Grade'), async (req, res) => {
    try {
        const { caMarks, examMarks, remarks } = req.body;

        const grade = await Grade.findById(req.params.id);
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        if (caMarks !== undefined) grade.caMarks = caMarks;
        if (examMarks !== undefined) grade.examMarks = examMarks;
        if (remarks !== undefined) grade.remarks = remarks;

        grade.modifiedBy = req.user._id;
        grade.modifiedAt = Date.now();

        await grade.save();

        const populatedGrade = await Grade.findById(grade._id)
            .populate('student', 'firstName lastName email')
            .populate('course', 'title code');

        res.json({
            success: true,
            data: populatedGrade
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/grades/course/:courseId
// @desc    Get all grades for a course (Academic Admin only)
// @access  Private/Academic Admin
router.get('/course/:courseId', protect, academicAdmin, async (req, res) => {
    try {
        const { semester, academicYear } = req.query;

        const query = { course: req.params.courseId };
        if (semester) query.semester = semester;
        if (academicYear) query.academicYear = academicYear;

        const grades = await Grade.find(query)
            .populate('student', 'firstName lastName email')
            .populate('course', 'title code')
            .sort({ 'student.lastName': 1 });

        res.json({
            success: true,
            count: grades.length,
            data: grades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch grades' });
    }
});

// @route   GET /api/grades/student/:studentId
// @desc    Get all grades for a student (Academic Admin only)
// @access  Private/Academic Admin
router.get('/student/:studentId', protect, academicAdmin, async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.params.studentId })
            .populate('course', 'title code')
            .sort({ academicYear: -1, semester: -1 });

        // Calculate overall GPA
        const totalGPA = grades.reduce((sum, grade) => sum + (grade.gpa || 0), 0);
        const overallGPA = grades.length > 0 ? (totalGPA / grades.length).toFixed(2) : 0;

        res.json({
            success: true,
            count: grades.length,
            overallGPA,
            data: grades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch student grades' });
    }
});

// @route   GET /api/grades/my
// @desc    Get current student's grades
// @access  Private/Student
router.get('/my', protect, async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.user._id })
            .populate('course', 'title code')
            .sort({ academicYear: -1, semester: -1 });

        // Calculate overall GPA
        const totalGPA = grades.reduce((sum, grade) => sum + (grade.gpa || 0), 0);
        const overallGPA = grades.length > 0 ? (totalGPA / grades.length).toFixed(2) : 0;

        res.json({
            success: true,
            count: grades.length,
            overallGPA,
            data: grades
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch your grades' });
    }
});

// @route   DELETE /api/grades/:id
// @desc    Delete a grade (Academic Admin only)
// @access  Private/Academic Admin
router.delete('/:id', protect, academicAdmin, async (req, res) => {
    try {
        const grade = await Grade.findByIdAndDelete(req.params.id);
        if (!grade) {
            return res.status(404).json({ success: false, message: 'Grade not found' });
        }

        res.json({
            success: true,
            message: 'Grade deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete grade' });
    }
});

export default router;
