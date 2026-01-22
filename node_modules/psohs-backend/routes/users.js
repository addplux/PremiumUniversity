const express = require('express');
const User = require('../models/User.js');
const { protect, systemAdmin } = require('../middleware/auth.js');
const { auditMiddleware, createAuditLog } = require('../utils/auditLogger.js');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (System Admin only)
// @access  Private/System Admin
router.get('/', protect, systemAdmin, async (req, res) => {
    try {
        const { role, search } = req.query;
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// @route   GET /api/users/search/roll/:rollNo
// @desc    Search student by roll number
// @access  Private/Admin
router.get('/search/roll/:rollNo', protect, async (req, res) => {
    try {
        const student = await User.findOne({
            rollNo: req.params.rollNo,
            role: 'student'
        }).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found with this roll number'
            });
        }

        res.json({
            success: true,
            data: student
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to search student'
        });
    }
});

// @route   POST /api/users
// @desc    Create new user (including admin accounts) - System Admin only
// @access  Private/System Admin
router.post('/', protect, systemAdmin, auditMiddleware('user_created', 'User'), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, role, dateOfBirth, address, city, rollNo, class: studentClass, course, branch, batch, parentsName } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Validate role
        const validRoles = ['student', 'finance_admin', 'system_admin', 'academic_admin'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: role || 'student',
            dateOfBirth,
            address,
            city,
            rollNo,
            class: studentClass,
            course,
            branch,
            batch,
            parentsName
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to create user';
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

// @route   PUT /api/users/:id
// @desc    Update user details (System Admin only)
// @access  Private/System Admin
router.put('/:id', protect, systemAdmin, auditMiddleware('user_updated', 'User'), async (req, res) => {
    try {
        const { firstName, lastName, phone, dateOfBirth, address, city, isVerified, rollNo, class: studentClass, course, branch, batch, parentsName } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (dateOfBirth) user.dateOfBirth = dateOfBirth;
        if (address) user.address = address;
        if (city) user.city = city;
        if (isVerified !== undefined) user.isVerified = isVerified;
        if (rollNo) user.rollNo = rollNo;
        if (studentClass) user.class = studentClass;
        if (course) user.course = course;
        if (branch) user.branch = branch;
        if (batch) user.batch = batch;
        if (parentsName) user.parentsName = parentsName;

        await user.save();

        res.json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
});

// @route   PUT /api/users/:id/role
// @desc    Change user role (System Admin only)
// @access  Private/System Admin
router.put('/:id/role', protect, systemAdmin, async (req, res) => {
    try {
        const { role } = req.body;

        const validRoles = ['student', 'finance_admin', 'system_admin', 'academic_admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const oldRole = user.role;
        user.role = role;
        await user.save();

        // Log role change
        await createAuditLog({
            userId: req.user._id,
            action: 'role_changed',
            targetModel: 'User',
            targetId: user._id,
            details: {
                oldRole,
                newRole: role,
                targetUser: user.email
            },
            req
        });

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update user role',
            error: error.message
        });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (System Admin only)
// @access  Private/System Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await user.deleteOne();

        // Log user deletion
        await createAuditLog({
            userId: req.user._id,
            action: 'user_deleted',
            targetModel: 'User',
            targetId: user._id,
            details: {
                deletedUser: {
                    email: user.email,
                    role: user.role,
                    name: `${user.firstName} ${user.lastName}`
                }
            },
            req
        });

        res.json({
            success: true,
            message: 'User removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

module.exports = router;
