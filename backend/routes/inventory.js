const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(inventoryController.getInventory)
    .post(inventoryController.addInventoryItem);

router.get('/low-stock', inventoryController.getLowStockAlerts);

router.post('/transfer', [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('fromWarehouseId').notEmpty().withMessage('Source warehouse is required'),
    body('toWarehouseId').notEmpty().withMessage('Destination warehouse is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], inventoryController.transferStock);

router.post('/adjust', [
    body('inventoryId').notEmpty().withMessage('Inventory ID is required'),
    body('quantity').isInt().withMessage('Quantity must be a number'),
    body('reason').trim().notEmpty().withMessage('Reason is required')
], inventoryController.adjustStock);

router.route('/:id')
    .get(inventoryController.getInventoryItem)
    .put(inventoryController.updateInventoryItem);

module.exports = router;
