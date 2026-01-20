const express = require('express');
const Lecture = require('../models/Lecture.js');
const { protect, systemAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/lectures
// @desc    Get all lectures with filters
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const { teacher, course, day, semester, academicYear } = req.query;
        const query = {};

        if (teacher) query.teacher = teacher;
        if (course) query.course = course;
        if (day) query['schedule.day'] = day;
        if (semester) query.semester = semester;
        if (academicYear) query.academicYear = academicYear;

        const lectures = await Lecture.find(query)
            .populate('course', 'code title')
            .populate('teacher', 'firstName lastName employeeId')
            .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });

        res.json({
            success: true,
            count: lectures.length,
            data: lectures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lectures'
        });
    }
});

// @route   GET /api/lectures/:id
// @desc    Get lecture by ID
// @access  Private/Admin
router.get('/:id', protect, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id)
            .populate('course', 'code title credits')
            .populate('teacher', 'firstName lastName employeeId email phone');

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        res.json({
            success: true,
            data: lecture
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lecture'
        });
    }
});

// @route   GET /api/lectures/teacher/:teacherId
// @desc    Get lectures by teacher
// @access  Private/Admin
router.get('/teacher/:teacherId', protect, async (req, res) => {
    try {
        const lectures = await Lecture.find({ teacher: req.params.teacherId })
            .populate('course', 'code title')
            .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });

        res.json({
            success: true,
            count: lectures.length,
            data: lectures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher lectures'
        });
    }
});

// @route   GET /api/lectures/course/:courseId
// @desc    Get lectures by course
// @access  Private/Admin
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const lectures = await Lecture.find({ course: req.params.courseId })
            .populate('teacher', 'firstName lastName employeeId')
            .sort({ 'schedule.day': 1, 'schedule.startTime': 1 });

        res.json({
            success: true,
            count: lectures.length,
            data: lectures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch course lectures'
        });
    }
});

// @route   POST /api/lectures
// @desc    Create new lecture
// @access  Private/System Admin
router.post('/', protect, systemAdmin, async (req, res) => {
    try {
        const { title, course, teacher, schedule, room, semester, academicYear, description } = req.body;

        const lecture = await Lecture.create({
            title,
            course,
            teacher,
            schedule,
            room,
            semester,
            academicYear,
            description
        });

        const populatedLecture = await Lecture.findById(lecture._id)
            .populate('course', 'code title')
            .populate('teacher', 'firstName lastName employeeId');

        res.status(201).json({
            success: true,
            message: 'Lecture created successfully',
            data: populatedLecture
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to create lecture';
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(val => val.message).join(', ');
        }
        res.status(400).json({
            success: false,
            message,
            error: error.message
        });
    }
});

// @route   PUT /api/lectures/:id
// @desc    Update lecture
// @access  Private/System Admin
router.put('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const { title, course, teacher, schedule, room, semester, academicYear, description } = req.body;

        const lecture = await Lecture.findById(req.params.id);
        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        if (title) lecture.title = title;
        if (course) lecture.course = course;
        if (teacher) lecture.teacher = teacher;
        if (schedule) lecture.schedule = schedule;
        if (room) lecture.room = room;
        if (semester) lecture.semester = semester;
        if (academicYear) lecture.academicYear = academicYear;
        if (description) lecture.description = description;

        await lecture.save();

        const populatedLecture = await Lecture.findById(lecture._id)
            .populate('course', 'code title')
            .populate('teacher', 'firstName lastName employeeId');

        res.json({
            success: true,
            message: 'Lecture updated successfully',
            data: populatedLecture
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update lecture',
            error: error.message
        });
    }
});

// @route   DELETE /api/lectures/:id
// @desc    Delete lecture
// @access  Private/System Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: 'Lecture not found'
            });
        }

        await lecture.deleteOne();

        res.json({
            success: true,
            message: 'Lecture removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lecture'
        });
    }
});

module.exports = router;
