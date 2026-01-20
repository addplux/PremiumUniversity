const express = require('express');
const OnlineClass = require('../models/OnlineClass.js');
const Course = require('../models/Course.js');
const Enrollment = require('../models/Enrollment.js');
const { protect, academicAdmin } = require('../middleware/auth.js');
const { auditMiddleware } = require('../utils/auditLogger.js');

const router = express.Router();

// @route   POST /api/online-classes
// @desc    Schedule an online class (Academic Admin only)
// @access  Private/Academic Admin
router.post('/', protect, academicAdmin, auditMiddleware('online_class_created', 'OnlineClass'), async (req, res) => {
    try {
        const { courseId, title, description, meetingLink, platform, scheduledDate, duration } = req.body;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        const onlineClass = await OnlineClass.create({
            course: courseId,
            title,
            description,
            meetingLink,
            platform,
            scheduledDate,
            duration,
            createdBy: req.user._id
        });

        const populatedClass = await OnlineClass.findById(onlineClass._id)
            .populate('course', 'title code');

        res.status(201).json({
            success: true,
            data: populatedClass
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/online-classes/:id
// @desc    Update online class details (Academic Admin only)
// @access  Private/Academic Admin
router.put('/:id', protect, academicAdmin, auditMiddleware('online_class_updated', 'OnlineClass'), async (req, res) => {
    try {
        const { title, description, meetingLink, platform, scheduledDate, duration, status, recordingUrl } = req.body;

        const onlineClass = await OnlineClass.findById(req.params.id);
        if (!onlineClass) {
            return res.status(404).json({ success: false, message: 'Online class not found' });
        }

        if (title) onlineClass.title = title;
        if (description) onlineClass.description = description;
        if (meetingLink) onlineClass.meetingLink = meetingLink;
        if (platform) onlineClass.platform = platform;
        if (scheduledDate) onlineClass.scheduledDate = scheduledDate;
        if (duration) onlineClass.duration = duration;
        if (status) onlineClass.status = status;
        if (recordingUrl) onlineClass.recordingUrl = recordingUrl;

        onlineClass.modifiedBy = req.user._id;
        onlineClass.modifiedAt = Date.now();

        await onlineClass.save();

        const populatedClass = await OnlineClass.findById(onlineClass._id)
            .populate('course', 'title code');

        res.json({
            success: true,
            data: populatedClass
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/online-classes/:id
// @desc    Cancel/delete an online class (Academic Admin only)
// @access  Private/Academic Admin
router.delete('/:id', protect, academicAdmin, auditMiddleware('online_class_cancelled', 'OnlineClass'), async (req, res) => {
    try {
        const onlineClass = await OnlineClass.findById(req.params.id);
        if (!onlineClass) {
            return res.status(404).json({ success: false, message: 'Online class not found' });
        }

        // Instead of deleting, mark as cancelled
        onlineClass.status = 'cancelled';
        onlineClass.modifiedBy = req.user._id;
        onlineClass.modifiedAt = Date.now();
        await onlineClass.save();

        res.json({
            success: true,
            message: 'Online class cancelled successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to cancel online class' });
    }
});

// @route   GET /api/online-classes
// @desc    Get all online classes (Academic Admin only)
// @access  Private/Academic Admin
router.get('/', protect, academicAdmin, async (req, res) => {
    try {
        const { status, courseId } = req.query;

        const query = {};
        if (status) query.status = status;
        if (courseId) query.course = courseId;

        const classes = await OnlineClass.find(query)
            .populate('course', 'title code')
            .populate('createdBy', 'firstName lastName')
            .sort({ scheduledDate: -1 });

        res.json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch online classes' });
    }
});

// @route   GET /api/online-classes/my
// @desc    Get online classes for student's enrolled courses
// @access  Private/Student
router.get('/my', protect, async (req, res) => {
    try {
        // Get enrolled course IDs
        const enrolledCourseIds = await Enrollment.find({
            student: req.user._id,
            status: 'enrolled'
        }).distinct('course');

        const classes = await OnlineClass.find({
            course: { $in: enrolledCourseIds },
            status: { $ne: 'cancelled' }
        })
            .populate('course', 'title code')
            .sort({ scheduledDate: 1 });

        res.json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch your online classes' });
    }
});

// @route   GET /api/online-classes/upcoming
// @desc    Get upcoming online classes
// @access  Private
router.get('/upcoming', protect, async (req, res) => {
    try {
        let query = {
            scheduledDate: { $gte: new Date() },
            status: 'scheduled'
        };

        // If student, filter by enrolled courses
        if (req.user.role === 'student') {
            const enrolledCourseIds = await Enrollment.find({
                student: req.user._id,
                status: 'enrolled'
            }).distinct('course');
            query.course = { $in: enrolledCourseIds };
        }

        const classes = await OnlineClass.find(query)
            .populate('course', 'title code')
            .sort({ scheduledDate: 1 })
            .limit(10);

        res.json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch upcoming classes' });
    }
});

module.exports = router;
