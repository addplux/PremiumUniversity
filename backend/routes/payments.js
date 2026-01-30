const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenantMiddleware');
const paymentController = require('../controllers/paymentController');

// All payment routes require tenant context
router.use(tenantMiddleware);
router.use(protect);

// Mobile Money Payment Routes
router.post('/mobile-money/initiate', paymentController.initiateMobilePayment);
router.get('/status/:id', paymentController.getPaymentStatus);
router.get('/my-payments', paymentController.getMyPayments);

// Callbacks (Webhooks) - these would typically be public and secured by IP/signature
// But for simplicity in this architecture, we keep them here. 
// In production, these should be on a separate public route.
router.post('/mpesa/callback', paymentController.mpesaCallback);
router.post('/airtel/callback', paymentController.airtelCallback);

module.exports = router;
