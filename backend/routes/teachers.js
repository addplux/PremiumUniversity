const express = require('express');
const Teacher = require('../models/Teacher.js');
const { protect, systemAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/teachers
// @desc    Get all teachers with search/filter
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const { search, department, status } = req.query;
        const query = {};

        if (department) query.department = department;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { employeeId: { $regex: search, $options: 'i' } }
            ];
        }

        const teachers = await Teacher.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: teachers.length,
            data: teachers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teachers'
        });
    }
});

// @route   GET /api/teachers/:id
// @desc    Get teacher by ID
// @access  Private/Admin
router.get('/:id', protect, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher'
        });
    }
});

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private/System Admin
router.post('/', protect, systemAdmin, async (req, res) => {
    try {
        const { employeeId, firstName, lastName, email, phone, department, qualification, specialization, dateOfJoining, address, city, salary, status } = req.body;

        // Check if teacher exists
        const teacherExists = await Teacher.findOne({ $or: [{ email }, { employeeId }] });
        if (teacherExists) {
            return res.status(400).json({
                success: false,
                message: 'Teacher already exists with this email or employee ID'
            });
        }

        const teacher = await Teacher.create({
            employeeId,
            firstName,
            lastName,
            email,
            phone,
            department,
            qualification,
            specialization,
            dateOfJoining,
            address,
            city,
            salary,
            status: status || 'active'
        });

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: teacher
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to create teacher';
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

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private/System Admin
router.put('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const { firstName, lastName, phone, department, qualification, specialization, dateOfJoining, address, city, salary, status } = req.body;

        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        if (firstName) teacher.firstName = firstName;
        if (lastName) teacher.lastName = lastName;
        if (phone) teacher.phone = phone;
        if (department) teacher.department = department;
        if (qualification) teacher.qualification = qualification;
        if (specialization) teacher.specialization = specialization;
        if (dateOfJoining) teacher.dateOfJoining = dateOfJoining;
        if (address) teacher.address = address;
        if (city) teacher.city = city;
        if (salary !== undefined) teacher.salary = salary;
        if (status) teacher.status = status;

        await teacher.save();

        res.json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update teacher',
            error: error.message
        });
    }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private/System Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        await teacher.deleteOne();

        res.json({
            success: true,
            message: 'Teacher removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete teacher'
        });
    }
});

module.exports = router;
