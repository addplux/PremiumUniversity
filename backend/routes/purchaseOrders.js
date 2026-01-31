const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(purchaseOrderController.getPurchaseOrders)
    .post(purchaseOrderController.createPurchaseOrder);

router.get('/:id', purchaseOrderController.getPurchaseOrder);

router.post('/:id/send', purchaseOrderController.sendToSupplier);
router.post('/:id/confirm', purchaseOrderController.confirmOrder);
router.post('/:id/receive', [
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('warehouseId').notEmpty().withMessage('Warehouse ID is required')
], purchaseOrderController.receiveGoods);
router.post('/:id/cancel', purchaseOrderController.cancelPurchaseOrder);

module.exports = router;
