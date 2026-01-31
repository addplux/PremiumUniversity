const PurchaseOrder = require('../models/PurchaseOrder');
const Supplier = require('../models/Supplier');
const Inventory = require('../models/Inventory');
const { generatePOPdf } = require('../utils/pdfGenerator');
const { sendEmail } = require('../services/emailService');

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
exports.getPurchaseOrders = async (req, res) => {
    try {
        const { status, supplierId, departmentId, page = 1, limit = 20 } = req.query;
        const organizationId = req.organizationId;

        const query = { organizationId };

        if (status) query.status = status;
        if (supplierId) query.supplierId = supplierId;
        if (departmentId) query.departmentId = departmentId;

        const purchaseOrders = await PurchaseOrder.find(query)
            .populate('supplierId', 'name email')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await PurchaseOrder.countDocuments(query);

        res.json({
            success: true,
            data: purchaseOrders,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching purchase orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching purchase orders',
            error: error.message
        });
    }
};

// @desc    Get single purchase order
// @route   GET /api/purchase-orders/:id
// @access  Private
exports.getPurchaseOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        })
            .populate('supplierId')
            .populate('requisitionId')
            .populate('createdBy', 'name email')
            .populate('items.productId', 'name sku');

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        res.json({
            success: true,
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error fetching purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching purchase order',
            error: error.message
        });
    }
};

// @desc    Create purchase order
// @route   POST /api/purchase-orders
// @access  Private
exports.createPurchaseOrder = async (req, res) => {
    try {
        const poData = {
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user._id
        };

        const purchaseOrder = await PurchaseOrder.create(poData);

        res.status(201).json({
            success: true,
            message: 'Purchase order created successfully',
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error creating purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating purchase order',
            error: error.message
        });
    }
};

// @desc    Send PO to supplier
// @route   POST /api/purchase-orders/:id/send
// @access  Private
exports.sendToSupplier = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        }).populate('supplierId');

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        if (purchaseOrder.status !== 'Draft' && purchaseOrder.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Only draft or approved purchase orders can be sent'
            });
        }

        purchaseOrder.status = 'Sent';
        purchaseOrder.sentToSupplierAt = new Date();
        await purchaseOrder.save();

        // Send email to supplier
        if (purchaseOrder.supplierId.email) {
            await sendEmail({
                to: purchaseOrder.supplierId.email,
                subject: `New Purchase Order: ${purchaseOrder.poNumber}`,
                html: `<p>Dear ${purchaseOrder.supplierId.name},</p>
                       <p>Please find attached Purchase Order ${purchaseOrder.poNumber}.</p>
                       <p>Please click here to acknowledge receipt and confirm this order.</p>`
            });
        }

        res.json({
            success: true,
            message: 'Purchase order sent to supplier',
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error sending purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending purchase order',
            error: error.message
        });
    }
};

// @desc    Supplier confirms PO
// @route   POST /api/purchase-orders/:id/confirm
// @access  Private
exports.confirmOrder = async (req, res) => {
    try {
        const purchaseOrder = await PurchaseOrder.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        if (purchaseOrder.status !== 'Sent') {
            return res.status(400).json({
                success: false,
                message: 'Only sent purchase orders can be confirmed'
            });
        }

        purchaseOrder.status = 'Confirmed';
        purchaseOrder.confirmedBySupplierAt = new Date();
        await purchaseOrder.save();

        // Update supplier performance
        await Supplier.findByIdAndUpdate(purchaseOrder.supplierId, {
            $inc: { 'performanceMetrics.totalOrders': 1 }
        });

        res.json({
            success: true,
            message: 'Purchase order confirmed',
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error confirming purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error confirming purchase order',
            error: error.message
        });
    }
};

// @desc    Receive goods
// @route   POST /api/purchase-orders/:id/receive
// @access  Private
exports.receiveGoods = async (req, res) => {
    try {
        const { items, warehouseId, notes } = req.body;

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        // Add delivery record
        purchaseOrder.deliveries.push({
            deliveryDate: new Date(),
            receivedBy: req.user._id,
            items,
            notes
        });

        // Update received quantities
        items.forEach(receivedItem => {
            const poItem = purchaseOrder.items.id(receivedItem.itemId);
            if (poItem) {
                poItem.receivedQuantity += receivedItem.quantity;
            }
        });

        // Update status
        const allReceived = purchaseOrder.items.every(
            item => item.receivedQuantity >= item.quantity
        );

        if (allReceived) {
            purchaseOrder.status = 'Delivered';
            purchaseOrder.actualDeliveryDate = new Date();
        } else {
            purchaseOrder.status = 'Partially Delivered';
        }

        await purchaseOrder.save();

        // Update inventory
        for (const receivedItem of items) {
            const poItem = purchaseOrder.items.id(receivedItem.itemId);
            if (poItem && poItem.productId) {
                await Inventory.findOneAndUpdate(
                    {
                        organizationId: req.organizationId,
                        productId: poItem.productId,
                        warehouseId
                    },
                    {
                        $inc: { quantity: receivedItem.quantity },
                        $set: { unitCost: poItem.unitPrice }
                    },
                    { upsert: true, new: true }
                );
            }
        }

        res.json({
            success: true,
            message: 'Goods received successfully',
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error receiving goods:', error);
        res.status(500).json({
            success: false,
            message: 'Error receiving goods',
            error: error.message
        });
    }
};

// @desc    Cancel purchase order
// @route   POST /api/purchase-orders/:id/cancel
// @access  Private
exports.cancelPurchaseOrder = async (req, res) => {
    try {
        const { reason } = req.body;

        const purchaseOrder = await PurchaseOrder.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!purchaseOrder) {
            return res.status(404).json({
                success: false,
                message: 'Purchase order not found'
            });
        }

        if (['Delivered', 'Completed', 'Cancelled'].includes(purchaseOrder.status)) {
            return res.status(400).json({
                success: false,
                message: 'This purchase order cannot be cancelled'
            });
        }

        purchaseOrder.status = 'Cancelled';
        purchaseOrder.cancelledAt = new Date();
        purchaseOrder.cancellationReason = reason;
        await purchaseOrder.save();

        res.json({
            success: true,
            message: 'Purchase order cancelled',
            data: purchaseOrder
        });
    } catch (error) {
        console.error('Error cancelling purchase order:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling purchase order',
            error: error.message
        });
    }
};
