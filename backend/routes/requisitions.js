const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const requisitionController = require('../controllers/requisitionController');
const { protect } = require('../middleware/auth');

router.use(protect);

const requisitionValidation = [
    body('departmentId').notEmpty().withMessage('Department ID is required'),
    body('departmentName').trim().notEmpty().withMessage('Department name is required'),
    body('requiredBy').isISO8601().withMessage('Required by date must be valid'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('purpose').trim().notEmpty().withMessage('Purpose is required')
];

router.route('/')
    .get(requisitionController.getRequisitions)
    .post(requisitionValidation, requisitionController.createRequisition);

router.get('/:id', requisitionController.getRequisition);

router.post('/:id/submit', requisitionController.submitRequisition);
router.post('/:id/approve', requisitionController.approveRequisition);
router.post('/:id/reject', requisitionController.rejectRequisition);
router.post('/:id/convert-to-po', [
    body('supplierId').notEmpty().withMessage('Supplier ID is required'),
    body('expectedDeliveryDate').isISO8601().withMessage('Expected delivery date must be valid')
], requisitionController.convertToPurchaseOrder);

module.exports = router;
