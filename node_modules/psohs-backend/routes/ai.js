const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const tenantMiddleware = require('../middleware/tenantMiddleware');
const aiController = require('../controllers/aiController');

router.use(tenantMiddleware);
router.use(protect);

// Student Routes (No admin check)
router.post('/tutor/chat', aiController.chatWithTutor);

// Admin Routes
router.use(admin);
router.post('/retention/sync/:studentId', aiController.syncStudentMetrics);
router.get('/retention/dashboard', aiController.getRetentionDashboard);

module.exports = router;
