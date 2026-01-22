const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const { protect: auth } = require('../middleware/auth');

// Get all homework (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { teacher, class: className, course, status } = req.query;
        const filter = {};

        if (teacher) filter.teacher = teacher;
        if (className) filter.class = className;
        if (course) filter.course = course;
        if (status) filter.status = status;

        const homework = await Homework.find(filter)
            .populate('teacher', 'firstName lastName')
            .populate('course', 'name code')
            .populate('submissions.student', 'firstName lastName email')
            .sort({ assignedDate: -1 });

        res.json(homework);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get homework by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id)
            .populate('teacher', 'firstName lastName email')
            .populate('course', 'name code')
            .populate('submissions.student', 'firstName lastName email');

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        res.json(homework);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new homework
router.post('/', auth, async (req, res) => {
    try {
        const homework = new Homework({
            ...req.body,
            teacher: req.user.id
        });

        await homework.save();
        res.status(201).json(homework);
    } catch (error) {
        res.status(400).json({ message: 'Error creating homework', error: error.message });
    }
});

// Update homework
router.put('/:id', auth, async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        // Check if user is teacher or admin
        if (homework.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(homework, req.body);
        await homework.save();

        res.json(homework);
    } catch (error) {
        res.status(400).json({ message: 'Error updating homework', error: error.message });
    }
});

// Submit homework (student)
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        if (homework.status !== 'published') {
            return res.status(400).json({ message: 'Homework is not published yet' });
        }

        const now = new Date();
        const isLate = now > homework.dueDate;

        if (isLate && !homework.allowLateSubmission) {
            return res.status(400).json({ message: 'Late submissions are not allowed' });
        }

        // Check if student already submitted
        const existingSubmission = homework.submissions.find(
            sub => sub.student.toString() === req.user.id
        );

        if (existingSubmission) {
            return res.status(400).json({ message: 'You have already submitted this homework' });
        }

        const submission = {
            student: req.user.id,
            submittedAt: now,
            files: req.body.files || [],
            comments: req.body.comments || '',
            status: isLate ? 'late' : 'submitted'
        };

        homework.submissions.push(submission);
        await homework.save();

        res.json({ message: 'Homework submitted successfully', submission });
    } catch (error) {
        res.status(400).json({ message: 'Error submitting homework', error: error.message });
    }
});

// Grade homework submission
router.patch('/:id/submissions/:submissionId/grade', auth, async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        // Check if user is teacher or admin
        if (homework.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const submission = homework.submissions.id(req.params.submissionId);

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        submission.grade = grade;
        submission.feedback = feedback;
        submission.gradedAt = new Date();
        submission.status = 'graded';

        await homework.save();

        res.json({ message: 'Homework graded successfully', submission });
    } catch (error) {
        res.status(400).json({ message: 'Error grading homework', error: error.message });
    }
});

// Delete homework
router.delete('/:id', auth, async (req, res) => {
    try {
        const homework = await Homework.findById(req.params.id);

        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }

        // Check if user is teacher or admin
        if (homework.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await homework.deleteOne();
        res.json({ message: 'Homework deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
