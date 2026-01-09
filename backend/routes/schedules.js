import express from 'express';
import Schedule from '../models/Schedule.js';
import Enrollment from '../models/Enrollment.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const schedules = await Schedule.find().populate('course', 'title code');
        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch schedules' });
    }
});

// @route   GET /api/schedules/my
// @desc    Get schedules for logged in student's enrolled courses
// @access  Private
router.get('/my', protect, async (req, res) => {
    try {
        const enrolledCourseIds = await Enrollment.find({ student: req.user._id, status: 'enrolled' }).distinct('course');
        const schedules = await Schedule.find({ course: { $in: enrolledCourseIds } }).populate('course', 'title code');
        res.json({ success: true, data: schedules });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch your schedule' });
    }
});

// @route   POST /api/schedules
// @desc    Create a schedule (Admin)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const schedule = await Schedule.create({ ...req.body, createdBy: req.user._id });
        res.status(201).json({ success: true, data: schedule });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Room is already booked for this time/day' });
        }
        res.status(500).json({ success: false, message: 'Failed to create schedule', error: error.message });
    }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete a schedule (Admin)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Schedule deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete schedule' });
    }
});

export default router;
