const PurchaseRequisition = require('../models/PurchaseRequisition');
const ApprovalWorkflow = require('../models/ApprovalWorkflow');
const PurchaseOrder = require('../models/PurchaseOrder');
const { validationResult } = require('express-validator');

// @desc    Get all requisitions
// @route   GET /api/requisitions
// @access  Private
exports.getRequisitions = async (req, res) => {
    try {
        const { status, departmentId, priority, page = 1, limit = 20 } = req.query;
        const organizationId = req.organizationId;

        const query = { organizationId };

        if (status) query.status = status;
        if (departmentId) query.departmentId = departmentId;
        if (priority) query.priority = priority;

        const requisitions = await PurchaseRequisition.find(query)
            .populate('requestedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await PurchaseRequisition.countDocuments(query);

        res.json({
            success: true,
            data: requisitions,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching requisitions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching requisitions',
            error: error.message
        });
    }
};

// @desc    Get single requisition
// @route   GET /api/requisitions/:id
// @access  Private
exports.getRequisition = async (req, res) => {
    try {
        const requisition = await PurchaseRequisition.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        })
            .populate('requestedBy', 'name email')
            .populate('approvalHistory.approvedBy', 'name email')
            .populate('items.productId', 'name sku');

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: 'Requisition not found'
            });
        }

        res.json({
            success: true,
            data: requisition
        });
    } catch (error) {
        console.error('Error fetching requisition:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching requisition',
            error: error.message
        });
    }
};

// @desc    Create new requisition
// @route   POST /api/requisitions
// @access  Private
exports.createRequisition = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const requisitionData = {
            ...req.body,
            organizationId: req.organizationId,
            requestedBy: req.user._id
        };

        const requisition = await PurchaseRequisition.create(requisitionData);

        res.status(201).json({
            success: true,
            message: 'Requisition created successfully',
            data: requisition
        });
    } catch (error) {
        console.error('Error creating requisition:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating requisition',
            error: error.message
        });
    }
};

// @desc    Submit requisition for approval
// @route   POST /api/requisitions/:id/submit
// @access  Private
exports.submitRequisition = async (req, res) => {
    try {
        const requisition = await PurchaseRequisition.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: 'Requisition not found'
            });
        }

        if (requisition.status !== 'Draft') {
            return res.status(400).json({
                success: false,
                message: 'Only draft requisitions can be submitted'
            });
        }

        requisition.status = 'Pending';
        await requisition.save();

        // TODO: Send notification to approvers

        res.json({
            success: true,
            message: 'Requisition submitted for approval',
            data: requisition
        });
    } catch (error) {
        console.error('Error submitting requisition:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting requisition',
            error: error.message
        });
    }
};

// @desc    Approve requisition
// @route   POST /api/requisitions/:id/approve
// @access  Private
exports.approveRequisition = async (req, res) => {
    try {
        const { comments } = req.body;
        const requisition = await PurchaseRequisition.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: 'Requisition not found'
            });
        }

        if (requisition.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending requisitions can be approved'
            });
        }

        // Add approval to history
        requisition.approvalHistory.push({
            approvedBy: req.user._id,
            action: 'Approved',
            level: requisition.currentApprovalLevel + 1,
            comments
        });

        requisition.currentApprovalLevel += 1;
        requisition.status = 'Approved';
        await requisition.save();

        res.json({
            success: true,
            message: 'Requisition approved successfully',
            data: requisition
        });
    } catch (error) {
        console.error('Error approving requisition:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving requisition',
            error: error.message
        });
    }
};

// @desc    Reject requisition
// @route   POST /api/requisitions/:id/reject
// @access  Private
exports.rejectRequisition = async (req, res) => {
    try {
        const { comments } = req.body;
        const requisition = await PurchaseRequisition.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: 'Requisition not found'
            });
        }

        if (requisition.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending requisitions can be rejected'
            });
        }

        requisition.approvalHistory.push({
            approvedBy: req.user._id,
            action: 'Rejected',
            level: requisition.currentApprovalLevel + 1,
            comments
        });

        requisition.status = 'Rejected';
        requisition.rejectionReason = comments;
        await requisition.save();

        res.json({
            success: true,
            message: 'Requisition rejected',
            data: requisition
        });
    } catch (error) {
        console.error('Error rejecting requisition:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting requisition',
            error: error.message
        });
    }
};

// @desc    Convert requisition to purchase order
// @route   POST /api/requisitions/:id/convert-to-po
// @access  Private
exports.convertToPurchaseOrder = async (req, res) => {
    try {
        const { supplierId, expectedDeliveryDate, deliveryAddress } = req.body;

        const requisition = await PurchaseRequisition.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!requisition) {
            return res.status(404).json({
                success: false,
                message: 'Requisition not found'
            });
        }

        if (requisition.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Only approved requisitions can be converted to purchase orders'
            });
        }

        if (requisition.purchaseOrderId) {
            return res.status(400).json({
                success: false,
                message: 'This requisition has already been converted to a purchase order'
            });
        }

        // Create purchase order
        const poData = {
            organizationId: req.organizationId,
            supplierId,
            requisitionId: requisition._id,
            departmentId: requisition.departmentId,
            departmentName: requisition.departmentName,
            createdBy: req.user._id,
            expectedDeliveryDate,
            items: requisition.items.map(item => ({
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                unitPrice: item.estimatedUnitPrice,
                totalPrice: item.estimatedTotal,
                specifications: item.specifications,
                notes: item.notes
            })),
            currency: requisition.currency,
            deliveryAddress
        };

        const purchaseOrder = await PurchaseOrder.create(poData);

        // Update requisition
        requisition.status = 'Converted';
        requisition.purchaseOrderId = purchaseOrder._id;
        await requisition.save();

        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data: {
                requisition,
                purchaseOrder
            }
        });
    } catch (error) {
        console.error('Error converting to purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error converting to purchase order',
            error: error.message
        });
    }
};
