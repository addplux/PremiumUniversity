const express = require('express');
const router = express.Router();
const Circular = require('../models/Circular');
const { protect: auth } = require('../middleware/auth');

// Get all circulars (with filters)
router.get('/', auth, async (req, res) => {
    try {
        const { category, priority, targetAudience, status } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (targetAudience) filter.targetAudience = targetAudience;
        if (status) filter.status = status;

        const circulars = await Circular.find(filter)
            .populate('issuedBy', 'firstName lastName')
            .populate('readBy.user', 'firstName lastName')
            .populate('acknowledgments.user', 'firstName lastName')
            .sort({ issuedDate: -1 });

        res.json(circulars);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get circular by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id)
            .populate('issuedBy', 'firstName lastName email')
            .populate('readBy.user', 'firstName lastName')
            .populate('acknowledgments.user', 'firstName lastName');

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        res.json(circular);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create new circular
router.post('/', auth, async (req, res) => {
    try {
        // Generate circular number (format: CIR/YYYY/XXXX)
        const year = new Date().getFullYear();
        const count = await Circular.countDocuments({
            circularNumber: new RegExp(`^CIR/${year}/`)
        });
        const circularNumber = `CIR/${year}/${String(count + 1).padStart(4, '0')}`;

        const circular = new Circular({
            ...req.body,
            circularNumber,
            issuedBy: req.user.id
        });

        await circular.save();
        res.status(201).json(circular);
    } catch (error) {
        res.status(400).json({ message: 'Error creating circular', error: error.message });
    }
});

// Update circular
router.put('/:id', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Check if user is issuer or admin
        if (circular.issuedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        Object.assign(circular, req.body);
        await circular.save();

        res.json(circular);
    } catch (error) {
        res.status(400).json({ message: 'Error updating circular', error: error.message });
    }
});

// Publish circular
router.patch('/:id/publish', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Check if user is issuer or admin
        if (circular.issuedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        circular.status = 'published';
        circular.publishedAt = new Date();

        await circular.save();
        res.json(circular);
    } catch (error) {
        res.status(400).json({ message: 'Error publishing circular', error: error.message });
    }
});

// Mark circular as read
router.post('/:id/read', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Check if already read
        const alreadyRead = circular.readBy.some(
            r => r.user.toString() === req.user.id
        );

        if (!alreadyRead) {
            circular.readBy.push({
                user: req.user.id,
                readAt: new Date()
            });
            await circular.save();
        }

        res.json({ message: 'Circular marked as read' });
    } catch (error) {
        res.status(400).json({ message: 'Error marking as read', error: error.message });
    }
});

// Acknowledge circular
router.post('/:id/acknowledge', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        if (!circular.requiresAcknowledgment) {
            return res.status(400).json({ message: 'This circular does not require acknowledgment' });
        }

        // Check if already acknowledged
        const alreadyAcknowledged = circular.acknowledgments.some(
            a => a.user.toString() === req.user.id
        );

        if (alreadyAcknowledged) {
            return res.status(400).json({ message: 'Already acknowledged' });
        }

        circular.acknowledgments.push({
            user: req.user.id,
            acknowledgedAt: new Date(),
            comments: req.body.comments || ''
        });

        await circular.save();
        res.json({ message: 'Circular acknowledged successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error acknowledging circular', error: error.message });
    }
});

// Delete circular
router.delete('/:id', auth, async (req, res) => {
    try {
        const circular = await Circular.findById(req.params.id);

        if (!circular) {
            return res.status(404).json({ message: 'Circular not found' });
        }

        // Check if user is issuer or admin
        if (circular.issuedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await circular.deleteOne();
        res.json({ message: 'Circular deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
