const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');

// @desc    Get all warehouses
// @route   GET /api/warehouses
// @access  Private
exports.getWarehouses = async (req, res) => {
    try {
        const { status, type, page = 1, limit = 20 } = req.query;
        const organizationId = req.organizationId;

        const query = { organizationId };

        if (status) query.status = status;
        if (type) query.type = type;

        const warehouses = await Warehouse.find(query)
            .populate('managerId', 'name email')
            .sort({ name: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Warehouse.countDocuments(query);

        res.json({
            success: true,
            data: warehouses,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching warehouses',
            error: error.message
        });
    }
};

// @desc    Get single warehouse
// @route   GET /api/warehouses/:id
// @access  Private
exports.getWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        })
            .populate('managerId', 'name email phone')
            .populate('staff.userId', 'name email');

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        res.json({
            success: true,
            data: warehouse
        });
    } catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching warehouse',
            error: error.message
        });
    }
};

// @desc    Create warehouse
// @route   POST /api/warehouses
// @access  Private
exports.createWarehouse = async (req, res) => {
    try {
        const warehouseData = {
            ...req.body,
            organizationId: req.organizationId,
            createdBy: req.user._id
        };

        const warehouse = await Warehouse.create(warehouseData);

        res.status(201).json({
            success: true,
            message: 'Warehouse created successfully',
            data: warehouse
        });
    } catch (error) {
        console.error('Error creating warehouse:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Warehouse with this code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating warehouse',
            error: error.message
        });
    }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
// @access  Private
exports.updateWarehouse = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        Object.assign(warehouse, req.body);
        await warehouse.save();

        res.json({
            success: true,
            message: 'Warehouse updated successfully',
            data: warehouse
        });
    } catch (error) {
        console.error('Error updating warehouse:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating warehouse',
            error: error.message
        });
    }
};

// @desc    Get warehouse inventory
// @route   GET /api/warehouses/:id/inventory
// @access  Private
exports.getWarehouseInventory = async (req, res) => {
    try {
        const warehouse = await Warehouse.findOne({
            _id: req.params.id,
            organizationId: req.organizationId
        });

        if (!warehouse) {
            return res.status(404).json({
                success: false,
                message: 'Warehouse not found'
            });
        }

        const inventory = await Inventory.find({
            organizationId: req.organizationId,
            warehouseId: req.params.id
        })
            .populate('productId', 'name sku category unit')
            .sort({ 'productId.name': 1 });

        const summary = {
            totalItems: inventory.length,
            totalValue: inventory.reduce((sum, item) => sum + item.totalValue, 0),
            lowStockItems: inventory.filter(item => item.quantity <= item.reorderLevel).length,
            outOfStockItems: inventory.filter(item => item.quantity === 0).length
        };

        res.json({
            success: true,
            data: {
                warehouse: {
                    name: warehouse.name,
                    code: warehouse.code,
                    capacity: warehouse.capacity,
                    capacityUtilization: warehouse.capacityUtilization
                },
                inventory,
                summary
            }
        });
    } catch (error) {
        console.error('Error fetching warehouse inventory:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching warehouse inventory',
            error: error.message
        });
    }
};
