const Supplier = require('../models/Supplier');
const { validationResult } = require('express-validator');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
exports.getSuppliers = async (req, res) => {
    try {
        const { status, category, search, page = 1, limit = 20 } = req.query;
        const organizationId = req.organizationId;

        // Build query
        const query = { organizationId };

        if (status) query.status = status;
        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } }
            ];
        }

        // Execute query with pagination
        const suppliers = await Supplier.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-documents -bankDetails'); // Exclude sensitive data from list

        const count = await Supplier.countDocuments(query);

        res.json({
            success: true,
            data: suppliers,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suppliers',
            error: error.message
        });
    }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
exports.getSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        res.json({
            success: true,
            data: supplier
        });
    } catch (error) {
        console.error('Error fetching supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching supplier',
            error: error.message
        });
    }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private
exports.createSupplier = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const supplierData = {
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user._id
        };

        const supplier = await Supplier.create(supplierData);

        res.status(201).json({
            success: true,
            message: 'Supplier created successfully',
            data: supplier
        });
    } catch (error) {
        console.error('Error creating supplier:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Supplier with this registration number or email already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating supplier',
            error: error.message
        });
    }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private
exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Update fields
        Object.assign(supplier, req.body);
        await supplier.save();

        res.json({
            success: true,
            message: 'Supplier updated successfully',
            data: supplier
        });
    } catch (error) {
        console.error('Error updating supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating supplier',
            error: error.message
        });
    }
};

// @desc    Delete/deactivate supplier
// @route   DELETE /api/suppliers/:id
// @access  Private
exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Soft delete - change status to Inactive
        supplier.status = 'Inactive';
        await supplier.save();

        res.json({
            success: true,
            message: 'Supplier deactivated successfully'
        });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting supplier',
            error: error.message
        });
    }
};

// @desc    Get supplier performance metrics
// @route   GET /api/suppliers/:id/performance
// @access  Private
exports.getSupplierPerformance = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        }).select('name performanceMetrics rating');

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        // Calculate additional metrics
        const performance = {
            ...supplier.performanceMetrics.toObject(),
            rating: supplier.rating,
            onTimeDeliveryRate: supplier.onTimeDeliveryRate,
            completionRate: supplier.completionRate
        };

        res.json({
            success: true,
            data: {
                supplierName: supplier.name,
                performance
            }
        });
    } catch (error) {
        console.error('Error fetching supplier performance:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching supplier performance',
            error: error.message
        });
    }
};

// @desc    Update supplier rating
// @route   PUT /api/suppliers/:id/rating
// @access  Private
exports.updateSupplierRating = async (req, res) => {
    try {
        const { rating } = req.body;

        if (rating < 0 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 0 and 5'
            });
        }

        const supplier = await Supplier.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found'
            });
        }

        supplier.rating = rating;
        await supplier.save();

        res.json({
            success: true,
            message: 'Supplier rating updated successfully',
            data: { rating: supplier.rating }
        });
    } catch (error) {
        console.error('Error updating supplier rating:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating supplier rating',
            error: error.message
        });
    }
};
