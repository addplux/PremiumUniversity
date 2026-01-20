import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, dateOfBirth, address, city } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user (all new registrations are students by default)
        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            address,
            city,
            role: 'student',
            dateOfBirth: dateOfBirth || undefined // Handle empty string which causes CastError
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id)
                }
            });
        }
    } catch (error) {
        console.error(error);

        let message = 'Registration failed';
        if (error.name === 'ValidationError') {
            message = Object.values(error.errors).map(val => val.message).join(', ');
        } else if (error.code === 11000) {
            message = 'Duplicate field value entered';
        }

        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            message: message,
            error: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user (email for admins, roll number for students)
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // email field can contain email or roll number

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide login credentials and password'
            });
        }

        // Check if input is email or roll number
        let user;
        if (email.includes('@')) {
            // Login with email (for admins)
            user = await User.findOne({ email }).select('+password');
        } else {
            // Login with roll number (for students)
            user = await User.findOne({ rollNo: email, role: 'student' }).select('+password');
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                rollNo: user.rollNo,
                role: user.role,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
});

// @route   PUT /api/auth/updateprofile
// @desc    Update user profile
// @access  Private
router.put('/updateprofile', protect, async (req, res) => {
    try {
        const { firstName, lastName, phone, dateOfBirth, address, city } = req.body;

        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.phone = phone || user.phone;
            user.dateOfBirth = dateOfBirth || user.dateOfBirth;
            user.address = address || user.address;
            user.city = city || user.city;

            const updatedUser = await user.save();

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
});

export default router;
