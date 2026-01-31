const express = require('express');
const router = express.Router();
const { setCriteria, submitScore, getResults } = require('../controllers/evaluationController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Admin Configuration
router.post('/criteria', authorize('admin', 'procurement_manager'), setCriteria);
router.get('/results/:tenderId', authorize('admin', 'procurement_manager'), getResults);

// Evaluator Action
router.post('/score', authorize('admin', 'procurement_manager', 'evaluator'), submitScore);

module.exports = router;
