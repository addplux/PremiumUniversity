const express = require('express');
const router = express.Router();
const LessonPlan = require('../models/LessonPlan');
const auth = require('../middleware/auth');

// Get all lesson plans (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { teacher, course, class: className, date, status } = req.query;
        const filter = {};

        if (teacher) filter.teacher = teacher;
        if (course) filter.course = course;
        if (className) filter.class = className;
        if (status) filter.status = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }

        const lessonPlans = await LessonPlan.find(filter)
            .populate('teacher', 'firstName lastName email')
            .populate('course', 'name code')
            .populate('approvedBy', 'firstName lastName')
            .sort({ date: -1 });

        res.json(lessonPlans);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get lesson plan by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const lessonPlan = await LessonPlan.findById(req.params.id)
            .populate('teacher', 'firstName lastName email')
            .populate('course', 'name code')
            .populate('approvedBy', 'firstName lastName');

        if (!lessonPlan) {
            return res.status(404).json({ message: 'Lesson plan not found' });
        }

        res.json(lessonPlan);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new lesson plan
router.post('/', auth, async (req, res) => {
    try {
        const lessonPlan = new LessonPlan({
            ...req.body,
            teacher: req.user.id
        });

        await lessonPlan.save();
        res.status(201).json(lessonPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error creating lesson plan', error: error.message });
    }
});

// Update lesson plan
router.put('/:id', auth, async (req, res) => {
    try {
        const lessonPlan = await LessonPlan.findById(req.params.id);

        if (!lessonPlan) {
            return res.status(404).json({ message: 'Lesson plan not found' });
        }

        // Check if user is the teacher or admin
        if (lessonPlan.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(lessonPlan, req.body);
        await lessonPlan.save();

        res.json(lessonPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error updating lesson plan', error: error.message });
    }
});

// Approve/Reject lesson plan
router.patch('/:id/approve', auth, async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const lessonPlan = await LessonPlan.findById(req.params.id);

        if (!lessonPlan) {
            return res.status(404).json({ message: 'Lesson plan not found' });
        }

        lessonPlan.status = status;
        lessonPlan.approvedBy = req.user.id;
        lessonPlan.approvedAt = new Date();

        await lessonPlan.save();
        res.json(lessonPlan);
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
});

// Delete lesson plan
router.delete('/:id', auth, async (req, res) => {
    try {
        const lessonPlan = await LessonPlan.findById(req.params.id);

        if (!lessonPlan) {
            return res.status(404).json({ message: 'Lesson plan not found' });
        }

        // Check if user is the teacher or admin
        if (lessonPlan.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await lessonPlan.deleteOne();
        res.json({ message: 'Lesson plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
