const express = require('express');
const FeeStructure = require('../models/FeeStructure.js');
const { protect, systemAdmin } = require('../middleware/auth.js');

const router = express.Router();

// @route   GET /api/fee-structures
// @desc    Get all fee structures
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { course, branch, academicYear } = req.query;
        const query = { isActive: true };

        if (course) query.course = course;
        if (branch) query.branch = branch;
        if (academicYear) query.academicYear = academicYear;

        const feeStructures = await FeeStructure.find(query).sort({ academicYear: -1 });

        res.json({
            success: true,
            count: feeStructures.length,
            data: feeStructures
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fee structures'
        });
    }
});

// @route   GET /api/fee-structures/:id
// @desc    Get fee structure by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findById(req.params.id);

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        res.json({
            success: true,
            data: feeStructure
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch fee structure'
        });
    }
});

// @route   POST /api/fee-structures
// @desc    Create fee structure
// @access  Private/System Admin
router.post('/', protect, systemAdmin, async (req, res) => {
    try {
        const { course, branch, academicYear, semesterFees, additionalFees } = req.body;

        // Check if fee structure already exists
        const existingStructure = await FeeStructure.findOne({
            course,
            branch,
            academicYear
        });

        if (existingStructure) {
            return res.status(400).json({
                success: false,
                message: 'Fee structure already exists for this course/branch/year'
            });
        }

        const feeStructure = await FeeStructure.create({
            course,
            branch,
            academicYear,
            semesterFees,
            additionalFees
        });

        res.status(201).json({
            success: true,
            message: 'Fee structure created successfully',
            data: feeStructure
        });
    } catch (error) {
        console.error(error);
        let message = 'Failed to create fee structure';
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

// @route   PUT /api/fee-structures/:id
// @desc    Update fee structure
// @access  Private/System Admin
router.put('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const { semesterFees, additionalFees, isActive } = req.body;

        const feeStructure = await FeeStructure.findById(req.params.id);
        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        if (semesterFees) feeStructure.semesterFees = semesterFees;
        if (additionalFees) feeStructure.additionalFees = additionalFees;
        if (isActive !== undefined) feeStructure.isActive = isActive;

        await feeStructure.save();

        res.json({
            success: true,
            message: 'Fee structure updated successfully',
            data: feeStructure
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: 'Failed to update fee structure',
            error: error.message
        });
    }
});

// @route   DELETE /api/fee-structures/:id
// @desc    Delete fee structure
// @access  Private/System Admin
router.delete('/:id', protect, systemAdmin, async (req, res) => {
    try {
        const feeStructure = await FeeStructure.findById(req.params.id);

        if (!feeStructure) {
            return res.status(404).json({
                success: false,
                message: 'Fee structure not found'
            });
        }

        await feeStructure.deleteOne();

        res.json({
            success: true,
            message: 'Fee structure removed successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete fee structure'
        });
    }
});

module.exports = router;
