const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const supplierController = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Validation middleware
const supplierValidation = [
    body('name').trim().notEmpty().withMessage('Supplier name is required'),
    body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
    body('taxId').trim().notEmpty().withMessage('Tax ID is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('category').isIn(['Goods', 'Services', 'Works', 'Consultancy', 'Other']).withMessage('Invalid category')
];

// Routes
router.route('/')
    .get(supplierController.getSuppliers)
    .post(supplierValidation, supplierController.createSupplier);

router.route('/:id')
    .get(supplierController.getSupplier)
    .put(supplierController.updateSupplier)
    .delete(supplierController.deleteSupplier);

router.get('/:id/performance', supplierController.getSupplierPerformance);
router.put('/:id/rating', supplierController.updateSupplierRating);

module.exports = router;
