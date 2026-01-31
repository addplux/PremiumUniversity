const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
exports.getInventory = async (req, res) => {
    try {
        const { warehouseId, productId, status, lowStock, page = 1, limit = 50 } = req.query;
        const organizationId = req.organizationId;

        const query = { organizationId };

        if (warehouseId) query.warehouseId = warehouseId;
        if (productId) query.productId = productId;
        if (status) query.status = status;

        const inventory = await Inventory.find(query)
            .populate('productId', 'name sku category unit')
            .populate('warehouseId', 'name code')
            .sort({ 'productId.name': 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Filter for low stock if requested
        let filteredInventory = inventory;
        if (lowStock === 'true') {
            filteredInventory = inventory.filter(item =>
                item.quantity <= item.reorderLevel
            );
        }

        const count = await Inventory.countDocuments(query);

        res.json({
            success: true,
            data: filteredInventory,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory',
            error: error.message
        });
    }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
exports.getInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        })
            .populate('productId')
            .populate('warehouseId')
            .populate('transactions.performedBy', 'name email');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('Error fetching inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching inventory item',
            error: error.message
        });
    }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private
exports.addInventoryItem = async (req, res) => {
    try {
        const itemData = {
            ...req.body,
            organizationId: req.organizationId
        };

        const item = await Inventory.create(itemData);

        // Add initial transaction
        item.addTransaction('Receipt', item.quantity, 'Initial Stock', req.user._id, 'Initial inventory setup');
        await item.save();

        res.status(201).json({
            success: true,
            message: 'Inventory item added successfully',
            data: item
        });
    } catch (error) {
        console.error('Error adding inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding inventory item',
            error: error.message
        });
    }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
exports.updateInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        Object.assign(item, req.body);
        await item.save();

        res.json({
            success: true,
            message: 'Inventory item updated successfully',
            data: item
        });
    } catch (error) {
        console.error('Error updating inventory item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating inventory item',
            error: error.message
        });
    }
};

// @desc    Transfer stock between warehouses
// @route   POST /api/inventory/transfer
// @access  Private
exports.transferStock = async (req, res) => {
    try {
        const { productId, fromWarehouseId, toWarehouseId, quantity, notes } = req.body;
        const organizationId = req.organizationId;

        // Validate quantity
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0'
            });
        }

        // Get source inventory
        const sourceItem = await Inventory.findOne({
            organizationId,
            productId,
            warehouseId: fromWarehouseId
        });

        if (!sourceItem) {
            return res.status(404).json({
                success: false,
                message: 'Source inventory item not found'
            });
        }

        if (sourceItem.availableQuantity < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock for transfer'
            });
        }

        // Reduce from source
        sourceItem.quantity -= quantity;
        sourceItem.addTransaction('Transfer', -quantity, `Transfer to ${toWarehouseId}`, req.user._id, notes);
        await sourceItem.save();

        // Add to destination
        const destItem = await Inventory.findOneAndUpdate(
            {
                organizationId,
                productId,
                warehouseId: toWarehouseId
            },
            {
                $inc: { quantity },
                $set: { unitCost: sourceItem.unitCost }
            },
            { upsert: true, new: true }
        );

        destItem.addTransaction('Transfer', quantity, `Transfer from ${fromWarehouseId}`, req.user._id, notes);
        await destItem.save();

        res.json({
            success: true,
            message: 'Stock transferred successfully',
            data: {
                source: sourceItem,
                destination: destItem
            }
        });
    } catch (error) {
        console.error('Error transferring stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error transferring stock',
            error: error.message
        });
    }
};

// @desc    Adjust stock (manual adjustment)
// @route   POST /api/inventory/adjust
// @access  Private
exports.adjustStock = async (req, res) => {
    try {
        const { inventoryId, quantity, reason, notes } = req.body;

        const item = await Inventory.findOne({
            _id: inventoryId,
            organizationId: req.organizationId
        });

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        const oldQuantity = item.quantity;
        item.quantity += quantity;

        if (item.quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment would result in negative stock'
            });
        }

        item.addTransaction('Adjustment', quantity, reason, req.user._id, notes);
        await item.save();

        res.json({
            success: true,
            message: 'Stock adjusted successfully',
            data: {
                oldQuantity,
                newQuantity: item.quantity,
                adjustment: quantity
            }
        });
    } catch (error) {
        console.error('Error adjusting stock:', error);
        res.status(500).json({
            success: false,
            message: 'Error adjusting stock',
            error: error.message
        });
    }
};

// @desc    Get low stock alerts
// @route   GET /api/inventory/low-stock
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
    try {
        const inventory = await Inventory.find({
            organizationId: req.organizationId,
            status: 'Available'
        })
            .populate('productId', 'name sku category')
            .populate('warehouseId', 'name code');

        const lowStockItems = inventory.filter(item =>
            item.quantity <= item.reorderLevel && item.quantity > 0
        );

        const outOfStockItems = inventory.filter(item =>
            item.quantity === 0
        );

        res.json({
            success: true,
            data: {
                lowStock: lowStockItems,
                outOfStock: outOfStockItems,
                summary: {
                    lowStockCount: lowStockItems.length,
                    outOfStockCount: outOfStockItems.length
                }
            }
        });
    } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching low stock alerts',
            error: error.message
        });
    }
};
