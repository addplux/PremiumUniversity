const express = require('express');
const router = express.Router();
const Syllabus = require('../models/Syllabus');
const auth = require('../middleware/auth');

// Get all syllabi (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { course, program, academicYear, semester, status } = req.query;
        const filter = {};

        if (course) filter.course = course;
        if (program) filter.program = program;
        if (academicYear) filter.academicYear = academicYear;
        if (semester) filter.semester = semester;
        if (status) filter.status = status;

        const syllabi = await Syllabus.find(filter)
            .populate('course', 'name code')
            .populate('program', 'name')
            .populate('createdBy', 'firstName lastName')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(syllabi);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get syllabus by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const syllabus = await Syllabus.findById(req.params.id)
            .populate('course', 'name code description')
            .populate('program', 'name')
            .populate('createdBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');

        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        res.json(syllabus);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new syllabus
router.post('/', auth, async (req, res) => {
    try {
        const syllabus = new Syllabus({
            ...req.body,
            createdBy: req.user.id
        });

        await syllabus.save();
        res.status(201).json(syllabus);
    } catch (error) {
        res.status(400).json({ message: 'Error creating syllabus', error: error.message });
    }
});

// Update syllabus
router.put('/:id', auth, async (req, res) => {
    try {
        const syllabus = await Syllabus.findById(req.params.id);

        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        // Check if user is creator or admin
        if (syllabus.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // If updating published syllabus, increment version
        if (syllabus.status === 'published' && req.body.status !== 'archived') {
            syllabus.version += 1;
            syllabus.status = 'draft';
        }

        Object.assign(syllabus, req.body);
        await syllabus.save();

        res.json(syllabus);
    } catch (error) {
        res.status(400).json({ message: 'Error updating syllabus', error: error.message });
    }
});

// Approve syllabus
router.patch('/:id/approve', auth, async (req, res) => {
    try {
        const syllabus = await Syllabus.findById(req.params.id);

        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        syllabus.status = 'approved';
        syllabus.approvedBy = req.user.id;
        syllabus.approvedAt = new Date();

        await syllabus.save();
        res.json(syllabus);
    } catch (error) {
        res.status(400).json({ message: 'Error approving syllabus', error: error.message });
    }
});

// Publish syllabus
router.patch('/:id/publish', auth, async (req, res) => {
    try {
        const syllabus = await Syllabus.findById(req.params.id);

        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        if (syllabus.status !== 'approved') {
            return res.status(400).json({ message: 'Syllabus must be approved before publishing' });
        }

        syllabus.status = 'published';
        syllabus.publishedAt = new Date();

        await syllabus.save();
        res.json(syllabus);
    } catch (error) {
        res.status(400).json({ message: 'Error publishing syllabus', error: error.message });
    }
});

// Delete syllabus
router.delete('/:id', auth, async (req, res) => {
    try {
        const syllabus = await Syllabus.findById(req.params.id);

        if (!syllabus) {
            return res.status(404).json({ message: 'Syllabus not found' });
        }

        // Check if user is creator or admin
        if (syllabus.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await syllabus.deleteOne();
        res.json({ message: 'Syllabus deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
