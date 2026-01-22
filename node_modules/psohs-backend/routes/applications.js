const express = require('express');
const Application = require('../models/Application.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// @route   POST /api/applications
// @desc    Submit new application
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const application = await Application.create({
            user: req.user._id,
            ...req.body
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
});

// @route   GET /api/applications/my
// @desc    Get current user's applications
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const applications = await Application.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        });
    }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id).populate('user', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns application or is admin
        if (application.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this application'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch application'
        });
    }
});

// @route   GET /api/applications
// @desc    Get all applications (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { program, status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (program) query.program = program;
        if (status) query.status = status;

        const applications = await Application.find(query)
            .populate('user', 'firstName lastName email phone')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Application.countDocuments(query);

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications'
        });
    }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status, comment } = req.body;

        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        application.reviewedAt = Date.now();
        application.reviewedBy = req.user._id;

        if (comment) {
            application.statusHistory.push({
                status,
                comment,
                updatedBy: req.user._id
            });
        }

        await application.save();

        res.json({
            success: true,
            message: 'Application status updated successfully',
            data: application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update application status'
        });
    }
});

// @route   DELETE /api/applications/:id
// @desc    Delete application
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user owns application or is admin
        if (application.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this application'
            });
        }

        await application.deleteOne();

        res.json({
            success: true,
            message: 'Application deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete application'
        });
    }
});

module.exports = router;
