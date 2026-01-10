import express from 'express';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Enrollment from '../models/Enrollment.js';
import { protect, academicAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/assignments
// @desc    Create new assignment (Admin only for now)
// @access  Private/Admin
router.post('/', protect, academicAdmin, async (req, res) => {
    try {
        const assignment = await Assignment.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/assignments/course/:courseId
// @desc    Get assignments for a course
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId })
            .sort({ deadline: 1 });

        res.json({
            success: true,
            count: assignments.length,
            data: assignments
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
    }
});

// @route   GET /api/assignments/:id
// @desc    Get single assignment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id).populate('course', 'title code');
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        let submission = null;
        if (req.user.role === 'student') {
            submission = await Submission.findOne({
                assignment: req.params.id,
                student: req.user._id
            });
        }

        res.json({
            success: true,
            data: {
                ...assignment._doc,
                mySubmission: submission
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch assignment' });
    }
});

// @route   POST /api/assignments/:id/submit
// @desc    Submit assignment
// @access  Private/Student
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Verify student is enrolled in the course
        const enrollment = await Enrollment.findOne({
            student: req.user._id,
            course: assignment.course
        });

        if (!enrollment) {
            return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
        }

        const submission = await Submission.create({
            assignment: req.params.id,
            student: req.user._id,
            content: req.body.content,
            fileUrl: req.body.fileUrl
        });

        res.status(201).json({
            success: true,
            data: submission
        });
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Already submitted this assignment' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   GET /api/assignments/:id/submissions
// @desc    Get all submissions for an assignment (Admin only)
// @access  Private/Admin
router.get('/:id/submissions', protect, academicAdmin, async (req, res) => {
    try {
        const submissions = await Submission.find({ assignment: req.params.id })
            .populate('student', 'firstName lastName email')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            count: submissions.length,
            data: submissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
});

// @route   PUT /api/assignments/submission/:id/grade
// @desc    Grade a submission
// @access  Private/Admin
router.put('/submission/:id/grade', protect, academicAdmin, async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.status = 'graded';
        submission.gradedAt = Date.now();
        submission.gradedBy = req.user._id;

        await submission.save();

        res.json({
            success: true,
            data: submission
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

export default router;
