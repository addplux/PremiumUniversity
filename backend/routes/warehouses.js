const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const warehouseController = require('../controllers/warehouseController');
const { protect } = require('../middleware/auth');

router.use(protect);

const warehouseValidation = [
    body('name').trim().notEmpty().withMessage('Warehouse name is required'),
    body('code').trim().notEmpty().withMessage('Warehouse code is required'),
    body('managerId').notEmpty().withMessage('Manager ID is required'),
    body('capacity.total').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
];

router.route('/')
    .get(warehouseController.getWarehouses)
    .post(warehouseValidation, warehouseController.createWarehouse);

router.route('/:id')
    .get(warehouseController.getWarehouse)
    .put(warehouseController.updateWarehouse);

router.get('/:id/inventory', warehouseController.getWarehouseInventory);

module.exports = router;
