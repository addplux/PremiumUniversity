const express = require('express');
const router = express.Router();
const Classwork = require('../models/Classwork');
const auth = require('../middleware/auth');

// Get all classwork (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { teacher, class: className, course, date, status } = req.query;
        const filter = {};

        if (teacher) filter.teacher = teacher;
        if (className) filter.class = className;
        if (course) filter.course = course;
        if (status) filter.status = status;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }

        const classwork = await Classwork.find(filter)
            .populate('teacher', 'firstName lastName')
            .populate('course', 'name code')
            .populate('participation.student', 'firstName lastName')
            .sort({ date: -1 });

        res.json(classwork);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get classwork by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const classwork = await Classwork.findById(req.params.id)
            .populate('teacher', 'firstName lastName email')
            .populate('course', 'name code')
            .populate('participation.student', 'firstName lastName email');

        if (!classwork) {
            return res.status(404).json({ message: 'Classwork not found' });
        }

        res.json(classwork);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new classwork
router.post('/', auth, async (req, res) => {
    try {
        const classwork = new Classwork({
            ...req.body,
            teacher: req.user.id
        });

        await classwork.save();
        res.status(201).json(classwork);
    } catch (error) {
        res.status(400).json({ message: 'Error creating classwork', error: error.message });
    }
});

// Update classwork
router.put('/:id', auth, async (req, res) => {
    try {
        const classwork = await Classwork.findById(req.params.id);

        if (!classwork) {
            return res.status(404).json({ message: 'Classwork not found' });
        }

        // Check if user is teacher or admin
        if (classwork.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(classwork, req.body);
        await classwork.save();

        res.json(classwork);
    } catch (error) {
        res.status(400).json({ message: 'Error updating classwork', error: error.message });
    }
});

// Record student participation
router.post('/:id/participation', auth, async (req, res) => {
    try {
        const classwork = await Classwork.findById(req.params.id);

        if (!classwork) {
            return res.status(404).json({ message: 'Classwork not found' });
        }

        // Check if user is teacher or admin
        if (classwork.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const { student, status, score, notes, submittedWork } = req.body;

        // Check if participation already exists
        const existingIndex = classwork.participation.findIndex(
            p => p.student.toString() === student
        );

        if (existingIndex !== -1) {
            // Update existing participation
            classwork.participation[existingIndex] = {
                student,
                status,
                score,
                notes,
                submittedWork
            };
        } else {
            // Add new participation
            classwork.participation.push({
                student,
                status,
                score,
                notes,
                submittedWork
            });
        }

        await classwork.save();
        res.json({ message: 'Participation recorded successfully', classwork });
    } catch (error) {
        res.status(400).json({ message: 'Error recording participation', error: error.message });
    }
});

// Update classwork status
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;

        const classwork = await Classwork.findById(req.params.id);

        if (!classwork) {
            return res.status(404).json({ message: 'Classwork not found' });
        }

        // Check if user is teacher or admin
        if (classwork.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        classwork.status = status;
        await classwork.save();

        res.json(classwork);
    } catch (error) {
        res.status(400).json({ message: 'Error updating status', error: error.message });
    }
});

// Delete classwork
router.delete('/:id', auth, async (req, res) => {
    try {
        const classwork = await Classwork.findById(req.params.id);

        if (!classwork) {
            return res.status(404).json({ message: 'Classwork not found' });
        }

        // Check if user is teacher or admin
        if (classwork.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await classwork.deleteOne();
        res.json({ message: 'Classwork deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
