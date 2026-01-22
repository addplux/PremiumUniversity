const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { protect: auth } = require('../middleware/auth');

// Get all materials (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { course, subject, type, uploadedBy, tags } = req.query;
        const filter = { isActive: true };

        if (course) filter.course = course;
        if (subject) filter.subject = subject;
        if (type) filter.type = type;
        if (uploadedBy) filter.uploadedBy = uploadedBy;
        if (tags) filter.tags = { $in: tags.split(',') };

        const materials = await Material.find(filter)
            .populate('course', 'name code')
            .populate('uploadedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.json(materials);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get material by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id)
            .populate('course', 'name code')
            .populate('uploadedBy', 'firstName lastName email');

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Increment views
        material.views += 1;
        await material.save();

        res.json(material);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new material
router.post('/', auth, async (req, res) => {
    try {
        const material = new Material({
            ...req.body,
            uploadedBy: req.user.id
        });

        await material.save();
        res.status(201).json(material);
    } catch (error) {
        res.status(400).json({ message: 'Error creating material', error: error.message });
    }
});

// Update material
router.put('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if user is uploader or admin
        if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(material, req.body);
        await material.save();

        res.json(material);
    } catch (error) {
        res.status(400).json({ message: 'Error updating material', error: error.message });
    }
});

// Increment download count
router.patch('/:id/download', auth, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        material.downloads += 1;
        await material.save();

        res.json({ message: 'Download count updated', downloads: material.downloads });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete material (soft delete)
router.delete('/:id', auth, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        // Check if user is uploader or admin
        if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        material.isActive = false;
        await material.save();

        res.json({ message: 'Material deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
