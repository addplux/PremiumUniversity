import express from 'express';
import Program from '../models/Program.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/programs
// @desc    Get all active programs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const programs = await Program.find({ isActive: true });

        res.json({
            success: true,
            count: programs.length,
            data: programs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programs'
        });
    }
});

// @route   GET /api/programs/:id
// @desc    Get single program
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            data: program
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch program'
        });
    }
});

// @route   POST /api/programs
// @desc    Create new program (Admin only)
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const program = await Program.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            data: program
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to create program',
            error: error.message
        });
    }
});

// @route   PUT /api/programs/:id
// @desc    Update program (Admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            message: 'Program updated successfully',
            data: program
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to update program'
        });
    }
});

// @route   DELETE /api/programs/:id
// @desc    Delete program (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const program = await Program.findByIdAndDelete(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            message: 'Program deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete program'
        });
    }
});

export default router;
