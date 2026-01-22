const express = require('express');
const Contact = require('../models/Contact.js');
const { protect, admin } = require('../middleware/auth.js');

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message, type } = req.body;

        const contact = await Contact.create({
            name,
            email,
            phone,
            subject,
            message,
            type: type || 'general'
        });

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully. We will get back to you soon.',
            data: contact
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (type) query.type = type;

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Contact.countDocuments(query);

        res.json({
            success: true,
            count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            data: contacts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contacts'
        });
    }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message (Admin only)
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch contact message'
        });
    }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status (Admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { status, response } = req.body;

        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        if (status) contact.status = status;
        if (response) {
            contact.response = response;
            contact.respondedAt = Date.now();
            contact.respondedBy = req.user._id;
        }

        await contact.save();

        res.json({
            success: true,
            message: 'Contact message updated successfully',
            data: contact
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update contact message'
        });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact message not found'
            });
        }

        res.json({
            success: true,
            message: 'Contact message deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete contact message'
        });
    }
});

module.exports = router;
